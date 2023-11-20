# Authentication App Nest

## Live Preview

The application is deployed using [Render Platform](https://render.com/) and can be accessed [here](https://auth-nest.onrender.com/).

## Environment Variables

| Key          | Value  | example                        | description           | required |
| ------------ | ------ | ------------------------------ | --------------------- | -------- |
| PORT         | number | 4000                           | Port to run server on | Yes      |
| DATABASE_URL | string | mongodb://127.0.0.1:27017/test | Full database url     | Yes      |
| JWT_SECRET   | string | hshhhh                         | JWT secret            | Yes      |

## Running the App Locally

Note: Make sure you update the `.env.development` file with your own env variables.

To run the application locally, run this command:

```bash
yarn && yarn start:dev
```

## Swagger Documentation

Swagger documentation is deployed on [here](https://auth-nest.onrender.com/api).

## Related Repositories

1. [Frontend](https://github.com/esmail-elmoussel/auth-next).
