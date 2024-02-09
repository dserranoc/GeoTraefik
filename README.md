# GeoTraefik Middleware

This project is a small server that acts as middleware to allow or block requests based on the IP, ASN, or country of the user making the request. It is designed to be used with Traefik using its own ForwardAuth middleware.

## Functionality

The middleware server checks the IP, ASN, or country of the incoming request and determines whether it should be allowed or blocked. If the IP, ASN, or country is allowed, the server returns an HTTP 200 response. If not, it returns an HTTP 404 response.

## Configuration

Download the GeoLite2 databases from MaxMind and place them in a directory. Then, configure the docker volumes accordingly. These databases are used to determine the country and ASN of the incoming requests.

The IPs, ASNs, or countries that are allowed or blocked can be configured in the `docker-compose.yml` file. This file is used to deploy the application in Docker.

## Usage

To use this middleware with Traefik, you need to configure Traefik to use the ForwardAuth middleware and point it to the URL of this server. The best way to do it is to connect Traefik to the middleware server using Docker's networking.

## Deployment

To deploy the application in Docker, follow these steps:

1. Make sure you have Docker installed on your system.
2. Update the `docker-compose.yml` file with the desired IP, ASN, or country configurations. This configurations are set in the `ALLOWED_IPS`, `ALLOWED_ASN`, and `ALLOWED_COUNTRIES` environment variables.
3. Run the following command to start the application:

```bash
docker-compose up -d
```

This will start the GeoIP middleware server and make it accessible to Traefik. 4. Configure Traefik to use the middleware server as a ForwardAuth middleware. This can be done by adding the following configuration to the Traefik configuration file:

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
