import Express from "express";
import { Reader } from "@maxmind/geoip2-node";

const app = new Express();

const PORT = process.env.PORT ?? 8000;

const ALLOWED_ASN = (process.env.ALLOWED_ASN ?? "").split(",");
const ALLOWED_COUNTRIES = (process.env.ALLOWED_COUNTRIES ?? "").split(",");
const ALLOWED_IPS = (process.env.ALLOWED_IPS ?? "").split(",");

app.get("/filter", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const asnReader = await Reader.open("./databases/GeoLite2-ASN.mmdb");
  const countryReader = await Reader.open("./databases/GeoLite2-Country.mmdb");
  try {
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
