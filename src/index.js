import Express from "express";
import { Reader } from "@maxmind/geoip2-node";
import logger from "./logger.js";

const app = new Express();

const PORT = process.env.PORT ?? 8000;

const databaseDir = "/data/geotraefik";

const ASNS = (process.env.ASNS ?? "").split(",");
const COUNTRIES = (process.env.COUNTRIES ?? "").split(",");
const IPS = (process.env.IPS ?? "").split(",");
const LIST_MODE = process.env.LIST_MODE ?? "block";

app.get("/filter", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    const asnReader = await Reader.open(`${databaseDir}/GeoLite2-ASN.mmdb`);
    const countryReader = await Reader.open(
      `${databaseDir}/GeoLite2-Country.mmdb`
    );
    const asnResponse = asnReader.asn(ip);
    const countryResponse = countryReader.country(ip);

    const { autonomousSystemNumber } = asnResponse;
    const { isoCode } = countryResponse.country;

    const conditions = {
      allow:
        COUNTRIES.includes(isoCode) ||
        ASNS.includes(autonomousSystemNumber.toString()) ||
        IPS.includes(ip),
      block: !(
        COUNTRIES.includes(isoCode) &&
        ASNS.includes(autonomousSystemNumber.toString()) &&
        IPS.includes(ip)
      ),
    };

    if (conditions[LIST_MODE]) {
      logger.allow(
        `LIST_MODE: ${LIST_MODE}, IP: ${ip}, ASN: ${autonomousSystemNumber}, Country: ${isoCode}`
      );
      res.sendStatus(200);
    } else {
      logger.block(
        `LIST_MODE: ${LIST_MODE}, IP: ${ip}, ASN: ${autonomousSystemNumber}, Country: ${isoCode}`
      );
      res.sendStatus(404);
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      logger.error(
        `Server could not find the database file at ${databaseDir}. Please download the database from MaxMind website and place it in the database directory or use the GeoIP update service to automatically download and update the database.`
      );
      return res.status(500).send("Database not found");
    }
    logger.error(
      `LIST_MODE: ${LIST_MODE}, IP: ${ip}, ASN: Unknown, Country: Unknown, Allowed (with errors): ${err}`
    );
    res.sendStatus(200);
  }
});

app.listen(PORT, () => {
  logger.info(`🚀 Server ready at http://localhost:${PORT}`);
});

export default app;
