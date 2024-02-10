# GeoTraefik Middleware

This project is a small server that acts as middleware to allow or block requests based on the IP, ASN, or country of the user making the request. It is designed to be used with Traefik using its own ForwardAuth middleware.

## Functionality

This service checks the IP, ASN, or country of the incoming request and determines whether it should be allowed or blocked. If the IP, ASN, or country is allowed, the server returns an HTTP 200 response. If not, it returns an HTTP 404 response.

## Configuration

The IPs, ASNs, or countries that are allowed or blocked as well as the list mode can be configured in the `docker-compose.yml` file.

## Deployment

To deploy the application in Docker, follow these steps:

1. Make sure you have Docker installed on your system. You can refer to the [official Docker documentation](https://docs.docker.com/get-docker/) for instructions on how to install Docker on your system.
2. Use the `docker-compose.yml` file to configure the application. Replace the placeholders with the actual values. The file should look like this:

```yaml
version: "3"
services:
  geoip:
    image: dserranoc/geotraefik
    container_name: geotraefik
    restart: unless-stopped
    ports:
      - 8000:8000
    networks:
      - proxy
    environment:
      - PORT=8000 # Change this if you want to use a different port, don't forget to change it in exposed ports as well.
      - COUNTRIES=
      - ASNS=
      - IPS=
      - LIST_MODE=block # Change this to "allow" or "block" to allow or block the IPs, ASNs, or countries in the list. If set to "allow", only the IPs, ASNs, or countries in the list will be allowed. If set to "block", the IPs, ASNs, or countries in the list will be blocked. If this value is not set, the default value is "block".
    volumes:
      - ./databases:/home/node/app/databases:ro

  geoipupdate:
    container_name: geoipupdate
    image: ghcr.io/maxmind/geoipupdate
    restart: unless-stopped
    environment:
      - GEOIPUPDATE_ACCOUNT_ID=XXXXXX # Replace with your MaxMind account ID
      - GEOIPUPDATE_LICENSE_KEY=XXXXXXXXXXXXXXXX # Replace with your MaxMind license key
      - "GEOIPUPDATE_EDITION_IDS=GeoLite2-ASN GeoLite2-City GeoLite2-Country"
      - GEOIPUPDATE_FREQUENCY=72 # Update the databases every 72 hours. Change this if you want to update the databases more or less frequently.
    volumes:
      - "./databases:/usr/share/GeoIP"

networks:
  proxy: # <--- name of the network used by Traefik and this middleware
    external: true
```

This docker-compose file have two services, the first one is the GeoIP middleware server and the second one is the GeoIPUpdate service. The GeoIPUpdate service is used to update the GeoLite2 databases every 72 hours. You can get more information about the GeoIPUpdate service in the [GeoIP Update Docker documentation](https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md).

3. Run the following command to start the application:

```bash
docker-compose up -d
```

This will start the GeoIP middleware server and make it accessible to Traefik.

## Usage

To use this middleware with Traefik, you need to configure Traefik to use the ForwardAuth middleware and point it to the URL of this server. Don't forget to connect Traefik and this service to the same docker network.

Configure Traefik to use the middleware server as a ForwardAuth middleware. This can be done by adding the following configuration to the Traefik configuration file:

```yaml
middlewares:
  geoip:
    forwardAuth:
      address: "http://[GEOIP_CONTAINER_NAME]:[PORT]/filter" # Replace [GEOIP_CONTAINER_NAME] with the name of the GeoIP middleware container and [PORT] with the port it is running on
```

This will make Traefik use the middleware server to check the incoming requests.

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue if you find a bug or have a feature request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
