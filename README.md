# Courseflow

> *Course evaluation, reimagined.*

A redesigned course evaluation site designed with simplicity and intuitiveness in mind.

## Stack

Courseflow is made with SvelteKit, a powerful all-in-one web framework for creating full stack applications.

Courseflow also uses [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs/) to provide translation of the site in different languages.

## Setup

Setting up Courseflow in an development environment is fairly easy.

> [!IMPORTANT]
> You'll need the following prerequisites: Node JS (recommended major version: 25), Git, and [Bun](https://bun.com/) installed globally (just follow [this guide to install it through NPM](https://bun.com/docs/installation#package-managers)). You'll also need [Docker](https://www.docker.com/products/docker-desktop/) installed and running.

First, clone this repository:
```
git clone https://github.com/C-A-R-Technologies/Courseflow.git
```

Then navigate into the newly created folder:
```
cd Courseflow
```

Next, take a look at `example.env` and `docker-compose.example.yml`. Decide on an username, password, and database name for your development environment, and match sure they match within those two files.

You'll then have to rename these two files: `example.env` -> `.env`, then `docker-compose.example.yml` -> `docker-compose.yml`.

Once they're renamed, go ahead and spin up that postgres container:
```
docker compose up
```
> [!TIP]
> This spins up the container with your terminal attached to the logs. Once you've confirmed its running without error, add the `-d` to *detach* your terminal from the logs on spin-up.

Finally, run the development server:
```
bun dev
```

---

> [!WARNING]
> The following setup information is not fully implemented.
> (Authentication hasn't been fully implemented, as of 3/10/26.)

On spin up, the site should automatically initialize an admin account, with the login information specified in your `.env`.