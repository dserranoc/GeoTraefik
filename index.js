import Express from "express";
import { Reader } from "@maxmind/geoip2-node";

const app = new Express();

const PORT = process.env.PORT ?? 8000;

const databaseDir = "/data/geotraefik";

const ALLOWED_ASN = (process.env.ALLOWED_ASN ?? "").split(",");
const ALLOWED_COUNTRIES = (process.env.ALLOWED_COUNTRIES ?? "").split(",");
const ALLOWED_IPS = (process.env.ALLOWED_IPS ?? "").split(",");

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

    if (
      ALLOWED_COUNTRIES.includes(isoCode) ||
      ALLOWED_ASN.includes(autonomousSystemNumber.toString()) ||
      ALLOWED_IPS.includes(ip)
    ) {
      console.log(
        `Date: ${new Date().toISOString()}, IP: ${ip}, ASN: ${autonomousSystemNumber}, Country: ${isoCode}, Allowed`
      );
      res.sendStatus(200);
    } else {
      console.log(
        `Date: ${new Date().toISOString()}, IP: ${ip}, ASN: ${autonomousSystemNumber}, Country: ${isoCode}, Blocked`
      );
      res.sendStatus(404);
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(
        `Date: ${new Date().toISOString()}, Error: Server could not find the database file at ${databaseDir}`
      );
      return res.status(500).send("Database not found");
    }
    console.log(
      `Date: ${new Date().toISOString()}, IP: ${ip}, ASN: Unknown, Country: Unknown, Allowed (with error)`
    );
    res.sendStatus(200);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});

export default app;
