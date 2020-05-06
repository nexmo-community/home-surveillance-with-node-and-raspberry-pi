![Vonage][logo]

# Building a Surveillance System With Raspberry Pi and Vonage

Have you ever wondered how to build your own home surveillance system? Whether this be to monitor your children, monitor vulnerable people in their home, or to be your home security system?

In this tutorial, you get to build a small and cheap home surveillance system using a Raspberry Pi 4 with a Raspberry Pi Camera module and motion sensor. The software side of this will be using Vonage Video Api (formerly TokBox) to publish the stream and Vonage SMS Api to notify the user that motion has been detected.

**Table of Contents**

- [Getting Started](#getting-started)
  - [Setting up the Raspberry Pi](#setting-up-the-raspberry-pi)
  - [Installing Raspberry Pi Camera Module](#installing-raspberry-pi-camera-module)
  - [Enabling SSH & Camera](#enabling-ssh--camera)
  - [Installing the Motion Sensor](#installing-motion-sensor)
  - [Node & NPM](#node--npm)
  - [Our CLI](#our-cli)
  - [Git (Optional)](#git-optional)
  - [Install a Mysql Server](#install-a-mysql-server)
  - [This Demo Application](#this-demo-application)
  - [Installing an SSL Certificate](#installing-an-ssl-certificate)
  - [Install Ngrok](#install-ngrok)
  - [Configure the Application](#configure-the-application)
    - [Create an Application](#create-an-application)
  - [Store the Credentials in the Environment](#store-the-credentials-in-the-environment)
  - [Run all Database Migrations](#run-all-database-migrations)
  - [Start the App](#start-the-app-locally)
- [Code of Conduct](#code-of-conduct)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Raspberry Pi Set up

On the Raspberry Pi website is a great [step by step guide](https://projects.raspberrypi.org/en/projects/raspberry-pi-setting-up) on what each part of the Raspberry Pi device is, how to get the Operating System installed, and how to get started with using a Raspberry Pi. On the site, there are also many other resources helping with troubleshooting any issues you may be having, or other projects that may interest you.

### Installing Raspberry Pi Camera Module

This code is configured to use a Raspberry Pi 4 and official Raspberry Pi Camera module, although other cameras may have no issues being used.

The photo below is the Raspberry Pi and a camera module I've used:

![Raspberry Pi][raspberrypi]

Connect the camera module as shown below:

![Raspberry Pi with Camera][raspberrypicamera]

### Enabling SSH & Camera

To enable SSH, in the Raspberry Pi Terminal, run

```bash
sudo raspi-config
```

You will be greeted with a screen that looks like the image below:

![Enable SSH & Camera][ssh-camera-enabling]

Choose option 5 - `Interfacing Options`

- From the next menu, choose Option P1 for `Camera`, then choose `Yes`
- Following this choose Option P2 for `SSH`, again choose `Yes`.

You have now enabled the Camera module and SSH on your Raspberry Pi.

### Installing the Motion Sensor

The next step is to wire the Raspberry Pi to a motion sensor, for which this example I've used an HC-SR501 PIR motion sensor. 

First, take the sensor and connect three wires to it. I've used red for the live, blue for the GPIO, and black for the ground. For the sensor in this example, the first pin is ground, second GPIO and third live as shown below:

![Wiring Sensor to Raspberry Pi Pt1][wiringpt1]

A great example to describe each of the pins of the Raspberry Pi is on [The Raspberry Pi Website.](https://www.raspberrypi.org/documentation/usage/gpio/) On this page is a diagram describing the layout of the GPIO pins, this diagram is shown below:

![GPIO Pinout Diagram][gpio-pinout]

The final part is connecting the wires to the Raspberry Pi. The live (red) wire needs to be connected to one of the `5V power` pins on the Pi, referring to the diagram above I used pin 2. The ground (black) wire needs to be connected to one of the `GND` pins on the Pi, again referring to the diagram I used pin 6. The final wire to connect is the GPIO (blue) wire, which needs to connect to one of the `GPIO` pins. In this example, I used pin 12, labelled "GPIO 18". 

You will see the wires wired up, as shown below:

![Wiring Sensor to Raspberry Pi Pt2][wiringpt2]

### Node & NPM

```bash
node --version
npm --version
```

> Both Node and NPM need to be installed and at the correct version. [Go to nodejs.org](https://nodejs.org/), download and install the correct version if you don't have it.

### Our CLI

To set up your application, you'll need to install [our CLI](https://www.npmjs.com/package/nexmo-cli). Install it using NPM in the terminal.

```bash
npm install -g nexmo-cli@beta
```

You can check you have the right version with this command. At the time of writing, I was using version `0.4.9-beta-3`.

```bash
nexmo --version
```

Remember to [sign up for a free Vonage account](https://dashboard.nexmo.com/sign-up) and configure the CLI with the API key and secret found on your dashboard.

```bash
nexmo setup <your_api_key> <your_api_secret>
```

### Git (Optional)

You can use git to clone the [demo application](https://github.com/GregHolmes/pi-cam) from GitHub.

> For those uncomfortable with git commands, don't worry, I've you covered.

Follow this [guide to install git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

### Install a Mysql Server

On the Raspberry Pi, run the following command to install the MySQL database server:

```bash
sudo apt install mariadb-server
```

By default MySQL is installed with the `root` user having no password. This needs to be rectified so the database isn't insecure. On the Pi run the command below and follow the instructions.

```bash
sudo mysql_secure_installation
```

Now the `root` user's password is set, it's time to create a database and user to access that database. Connect to the MySQL server:

```bash
sudo mysql -u root -p
```

```sql
-- Creates the database with the name picam
CREATE DATABASE picam;
-- Creates a new database user "camuser" with a password "securemypass" and grants them access to picam
GRANT ALL PRIVILEGES ON picam.* TO `camuser`@localhost IDENTIFIED BY "securemypass";
-- Flushes these updates to the database
FLUSH PRIVILEGES;
```

Your database is now set up!

### This Demo Application

Clone or download the demo application. To download, [go to the repository](https://github.com/GregHolmes/pi-cam) and click on the *Clone or download* button on GitHub.

> ***Note:*** If you download, make sure you're on the right version number before downloading.

```bash
git clone git@github.com:GregHolmes/home-surveillance-system-with-raspberry-pi.git
```

Once unzipped or cloned, change into the directory.

```bash
cd home-surveillance-system-with-raspberry-pi-master/
```

Then, use npm to install the dependencies for the server and client apps.

```bash
npm install
```

### Installing an SSL Certificate

Inside your Raspberry Pis Terminal, change directory to your project path and run the following command to generate a self signed SSL certificate, this is required for Vonage Video to work.

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

### Install Ngrok

Ngrok allows users to expose their webserver running on a local machine to the Internet without needing to configure their router or expose their IP address. To install Ngrok, inside the project directory run:

```bash
npm install ngrok
```

### Configure the Application

Using our CLI, set up the service and configure the app with credentials to begin.

```bash
nexmo setup <api_key> <api_secret>
```

#### Create an Application

Create an application with messages capabilities. The inbound url and status url don't matter at this point as the code will automatically update these when an ngrok instance is created.

```bash
nexmo app:create "My Messages App" --capabilities=messages --messages-inbound-url=https://example.com/webhooks/inbound-message --messages-status-url=https://example.com/webhooks/message-status --keyfile=private.key
# Application created: <Application id>
# Credentials written to .nexmo-app
# Private Key saved to: private.key
```

### Store the Credentials in the Environment

Create an account on both: 
- [Vonage (formally Nexmo)](https://dashboard.nexmo.com/sign-up?utm_source=DEV_REL&utm_medium=github&utm_campaign=https://github.com/nexmo-community/home-surveillance-with-raspberry-pi)
- [Vonage Video (formally Tokbox)](https://tokbox.com/account/user/signup?utm_source=DEV_REL&utm_medium=github&utm_campaign=https://github.com/nexmo-community/home-surveillance-with-raspberry-pi)

Now, create a `.env` file and add the credentials you've now generated.

```bash
# Create a Project on Tokbox.com and use api key and secret key found there.
VONAGE_VIDEO_API_KEY=
VONAGE_VIDEO_API_SECRET=

# Retrieve api key and secret key on https://dashboard.nexmo.com/getting-started-guide
VONAGE_API_KEY=
VONAGE_API_SECRET=

# The name of your company / unique to you
VONAGE_BRAND_NAME=

# as generated from `nexmo app:create` above
VONAGE_APPLICATION_ID=
# path to private.key generated by `nexmo app:create` eg. /home/pi/pi-cam/private.key
VONAGE_APPLICATION_PRIVATE_KEY_PATH=
# the number to receive SMS notifications
TO_NUMBER=

# database name and credentials you specified when configuring your database
DB_NAME=
DB_USERNAME=
DB_PASSWORD=
# default host and port, unless specified otherwise
DB_HOST=127.0.0.1
DB_PORT=3306

#Duration for video session on motion detection (In milliseconds)
VIDEO_SESSION_DURATION=
```

### Run all Database Migrations

There are generated migrations within the `migrations/` table. Running the command below creates the specified database tables into the database.

```
npx sequelize db:migrate 
```

### Start the App

In your Terminal, navigate to the project root directory and type:

```
node server.js
```

This will run your server monitoring for motion sensor, then proceeding to start a Vonage Video Session, and SMS your specified number with the link to view. 

## Code of Conduct

In the interest of fostering an open and welcoming environment, we strive to make participation in our project and our community a harassment-free experience for everyone. Please check out our [Code of Conduct][coc] in full.

## Contributing
We :heart: contributions from everyone! Check out the [Contributing Guidelines][contributing] for more information.

[![contributions welcome][contribadge]][issues]

## License

This project is subject to the [MIT License][license]

[logo]: vonage_logo.png "Vonage"
[ssh-camera-enabling]: ./readme-images/enable-ssh-camera.png "Enable SSH & Camera"
[raspberrypi]: ./readme-images/raspberry-pi.jpeg "Raspberry Pi"
[raspberrypicamera]: ./readme-images/raspberry-pi-camera-ribbon.jpeg "Raspberry Pi with Camera"
[wiringpt1]: ./readme-images/sensor-wiring-pt1.jpeg "Wiring Sensor Pt 1"
[wiringpt2]: ./readme-images/sensor-wiring-pt2.jpeg "Wiring Sensor Pt 2"
[gpio-pinout]: ./readme-images/GPIO-Pinout-Diagram-2.png "GPIO Pinout Diagram"

[contribadge]: https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat "Contributions Welcome"

[coc]: CODE_OF_CONDUCT.md "Code of Conduct"
[contributing]: CONTRIBUTING.md "Contributing"
[license]: LICENSE "MIT License"

[issues]: ./../../issues "Issues"