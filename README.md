# Nucleus Labs 3D Printing Platform

A professional 3D printing service platform built on Payload CMS and Next.js 15, designed for Nucleus Labs in Savannah, GA.

## Overview

This platform facilitates a complete 3D printing workflow from file upload to payment processing, serving SCAD students and the public with Bambu Labs X1C printing services.

Core features:

- [Pre-configured Payload Config](#how-it-works)
- [Authentication](#users-authentication)
- [Access Control](#access-control)
- [Layout Builder](#layout-builder)
- [Draft Preview](#draft-preview)
- [Live Preview](#live-preview)
- [On-demand Revalidation](#on-demand-revalidation)
- [SEO](#seo)
- [Search & Filters](#search)
- [Jobs and Scheduled Publishing](#jobs-and-scheduled-publish)
- [Website](#website)
- [Products & Variants](#products-and-variants)
- [User accounts](#user-accounts)
- [Carts](#carts)
- [Guest checkout](#guests)
- [Orders & Transactions](#orders-and-transactions)
- [Stripe Payments](#stripe)
- [Currencies](#currencies)
- [Automated Tests](#tests)

## Quick Start

### Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)

### Environment Setup

1. Copy `.env.example` to `.env`: `cp .env.example .env`
2. Update the following variables in `.env`:
   - `PAYLOAD_SECRET`: Generate a secure random string (32+ characters). **Use different secrets for dev/staging/production**
   - `DATABASE_URI`: Replace `<db_password>` with your MongoDB Atlas password
   - For development, the database name is `nucleus-labs-dev`
   - For production, change it to `nucleus-labs-prod`

**Important Security Notes:**
- Never commit `.env` files to git (already protected in `.gitignore`)
- Use different `PAYLOAD_SECRET` values for each environment
- MongoDB credentials should be stored securely (use Vercel environment variables in production)

### Local Development

To spin up this example locally, follow these steps:

### Clone

If you have not done so already, you need to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

#### Method 1

Use the `create-payload-app` CLI to clone this template directly to your machine:

```bash
pnpx create-payload-app my-project -t ecommerce
```

#### Method 2

Use the `git` CLI to clone this template directly to your machine:

```bash
git clone -n --depth=1 --filter=tree:0 https://github.com/payloadcms/payload my-project && cd my-project && git sparse-checkout set --no-cone templates/ecommerce && git checkout && rm -rf .git && git init && git add . && git mv -f templates/ecommerce/{.,}* . && git add . && git commit -m "Initial commit"
```

### Development

1. First [clone the repo](#clone) if you have not done so already
1. `cd my-project && cp .env.example .env` to copy the example environment variables
1. `pnpm install && pnpm dev` to install dependencies and start the dev server
1. open `http://localhost:3000` to open the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel and unpublished content. See [Access Control](#access-control) for more details.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Pages

  All pages are layout builder enabled so you can generate unique layouts for each page using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Pages are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Media

  This is the uploads enabled collection used by pages, posts, and projects to contain media like images, videos, downloads, and other assets. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

- #### Print Files

  **NEW**: Specialized collection for managing 3D print files (STL, 3MF, OBJ). Features:
  - Secure file upload with validation
  - File size tracking and metadata
  - Security scan status tracking
  - 3D file analysis fields (volume, surface area, bounding box, print time estimation)
  - User-specific access control
  - Order association

  Access Control:
  - Customers can only view/manage their own files
  - Admins have full access to all files
  - Files stored locally in development, Vercel Blob in production

- #### Categories

  A taxonomy used to group products together.

- ### Carts

  Used to track user and guest carts within Payload. Added by the [ecommerce plugin](https://payloadcms.com/docs/ecommerce/plugin#carts).

- ### Addresses

  Saves user's addresses for easier checkout. Added by the [ecommerce plugin](https://payloadcms.com/docs/ecommerce/plugin#addresses).

- ### Orders

  Tracks orders once a transaction successfully completes. Added by the [ecommerce plugin](https://payloadcms.com/docs/ecommerce/plugin#orders).

- ### Transactions

  Tracks transactions from initiation to completion, once completed they will have a related Order item. Added by the [ecommerce plugin](https://payloadcms.com/docs/ecommerce/plugin#transactions).

- ### Products and Variants

  Primary collections for product details such as pricing per currency and optionally supports variants per product. Added by the [ecommerce plugin](https://payloadcms.com/docs/ecommerce/plugin#products).

### Globals

See the [Globals](https://payloadcms.com/docs/configuration/globals) docs for details on how to extend this functionality.

- `Header`

  The data required by the header on your front-end like nav links.

- `Footer`

  Same as above but for the footer of your site.

## Access control

Basic access control is setup to limit access to various content based based on publishing status.

- `users`: Users with the `admin` role can access the admin panel and create or edit content, users with the `customer` role can only access the frontend and the relevant collection items to themselves.
- `pages`: Everyone can access published pages, but only admin users can create, update, or delete them.
- `products` `variants`: Everyone can access published products, but only admin users can create, update, or delete them.
- `carts`: Customers can access their own saved cart, guest users can access any unclaimed cart by ID.
- `addresses`: Customers can access their own addresses for record keeping.
- `transactions`: Only admins can access these as they're meant for internal tracking.
- `orders`: Only admins and users who own the orders can access these.

For more details on how to extend this functionality, see the [Payload Access Control](https://payloadcms.com/docs/access-control/overview#access-control) docs.

## User accounts

## Guests

## Layout Builder

Create unique page layouts for any type of content using a powerful layout builder. This template comes pre-configured with the following layout building blocks:

- Hero
- Content
- Media
- Call To Action
- Archive

Each block is fully designed and built into the front-end website that comes with this template. See [Website](#website) for more details.

## Lexical editor

A deep editorial experience that allows complete freedom to focus just on writing content without breaking out of the flow with support for Payload blocks, media, links and other features provided out of the box. See [Lexical](https://payloadcms.com/docs/rich-text/overview) docs.

## Draft Preview

All products and pages are draft-enabled so you can preview them before publishing them to your website. To do this, these collections use [Versions](https://payloadcms.com/docs/configuration/collections#versions) with `drafts` set to `true`. This means that when you create a new product or page, it will be saved as a draft and will not be visible on your website until you publish it. This also means that you can preview your draft before publishing it to your website. To do this, we automatically format a custom URL which redirects to your front-end to securely fetch the draft version of your content.

Since the front-end of this template is statically generated, this also means that pages, products, and projects will need to be regenerated as changes are made to published documents. To do this, we use an `afterChange` hook to regenerate the front-end when a document has changed and its `_status` is `published`.

For more details on how to extend this functionality, see the official [Draft Preview Example](https://github.com/payloadcms/payload/tree/examples/draft-preview).

## Live preview

In addition to draft previews you can also enable live preview to view your end resulting page as you're editing content with full support for SSR rendering. See [Live preview docs](https://payloadcms.com/docs/live-preview/overview) for more details.

## On-demand Revalidation

We've added hooks to collections and globals so that all of your pages, products, footer, or header changes will automatically be updated in the frontend via on-demand revalidation supported by Nextjs.

> Note: if an image has been changed, for example it's been cropped, you will need to republish the page it's used on in order to be able to revalidate the Nextjs image cache.

## SEO

This template comes pre-configured with the official [Payload SEO Plugin](https://payloadcms.com/docs/plugins/seo) for complete SEO control from the admin panel. All SEO data is fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

## Search

This template comes with SSR search features can easily be implemented into Next.js with Payload. See [Website](#website) for more details.

## Orders and Transactions

Transactions are intended for keeping a record of any payment made, as such it will contain information regarding an order or billing address used or the payment method used and amount. Only admins can access transactions.

An order is created only once a transaction is successfully completed. This is a record that the user who completed the transaction has access so they can keep track of their history. Guests can also access their own orders by providing an order ID and the email associated with that order.

## Currencies

By default the template ships with support only for USD however you can change the supported currencies via the [plugin configuration](https://payloadcms.com/docs/ecommerce/plugin#currencies). You will need to ensure that the supported currencies in Payload are also configured in your Payment platforms.

## Stripe

By default we ship with the Stripe adapter configured, so you'll need to setup the `secretKey`, `publishableKey` and `webhookSecret` from your Stripe dashboard. Follow [Stripe's guide](https://docs.stripe.com/get-started/api-request?locale=en-GB) on how to set this up.

### Stripe Webhook Configuration

**Local Development:**

1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run the webhook forwarder:
   ```bash
   pnpm stripe-webhooks
   ```
   This forwards webhooks to: `http://localhost:3000/api/payments/stripe/webhooks`

3. The CLI will output a webhook signing secret (starts with `whsec_`)
4. Copy it to your `.env` file:
   ```
   STRIPE_WEBHOOKS_SIGNING_SECRET=whsec_...
   ```

**Testing the Webhook Endpoint:**

The ecommerce plugin automatically creates the webhook endpoint at `/api/payments/stripe/webhooks`.

1. Trigger a test webhook from Stripe CLI:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

2. The endpoint automatically returns `{ "received": true }` with status 200 on success, or 400 on error

**Production Setup:**

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-domain.com/api/payments/stripe/webhooks`
3. Select events to receive (or "receive all events")
4. Copy the webhook signing secret
5. Add to production environment variables as `STRIPE_WEBHOOKS_SIGNING_SECRET`

**Adding Custom Webhook Handlers:**

You can add custom webhook handlers in your Stripe adapter config (`src/plugins/index.ts`):

```typescript
stripeAdapter({
  secretKey: process.env.STRIPE_SECRET_KEY!,
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
  webhooks: {
    'payment_intent.succeeded': ({ event, req, stripe }) => {
      console.log('Payment succeeded:', event.data.object.id)
      req.payload.logger.info('Payment succeeded')
    },
    'checkout.session.completed': ({ event, req, stripe }) => {
      console.log('Checkout completed:', event.data.object.id)
    },
  },
})
```

## Tests

We provide automated tests out of the box for both E2E and Int tests along with this template. They are being run in our CI to ensure the stability of this template over time. You can integrate them into your CI or run them locally as well via:

To run Int tests wtih Vitest:

```bash
pnpm test:int
```

To run E2Es with Playwright:

```bash
pnpm test:e2e
```

or

```bash
pnpm test
```

To run both.

## Jobs and Scheduled Publish

We have configured [Scheduled Publish](https://payloadcms.com/docs/versions/drafts#scheduled-publish) which uses the [jobs queue](https://payloadcms.com/docs/jobs-queue/jobs) in order to publish or unpublish your content on a scheduled time. The tasks are run on a cron schedule and can also be run as a separate instance if needed.

> Note: When deployed on Vercel, depending on the plan tier, you may be limited to daily cron only.

## Implementation Status

### Phase 1: File Upload System (Completed)

The first phase of the Nucleus Labs platform has been implemented with the following features:

### New Order Flow

A multi-step order process accessible at `/new-order`:

1. **File Upload** (Phase 1 - Completed)
2. **Material Selection** (Coming in Phase 3)
3. **Color Selection** (Coming in Phase 3)
4. **Checkout** (Coming in Phase 3)

### Components

#### OrderStepper (`src/components/order/OrderStepper.tsx`)
A visual progress indicator matching the Figma design:
- Clean, minimal styling with #3a3a3a primary color
- Step indicators with connecting lines
- Active/completed/upcoming states
- Responsive layout

#### FileUpload (`src/components/order/FileUpload.tsx`)
Professional drag-and-drop file upload interface:
- Supports STL, 3MF, and OBJ files up to 100MB
- Drag-and-drop zone with visual feedback
- File validation and error handling
- Upload progress indicators
- Success/error status display
- Integration with Payload CMS PrintFiles collection

### API Routes

#### `/api/upload-print-file` (POST)
Handles 3D print file uploads:
- User authentication required
- File type validation (STL, 3MF, OBJ)
- File size validation (100MB max)
- Creates PrintFiles collection record
- Prepares for future security scanning and file analysis

### File Storage

- **Development**: Local file storage in `uploads/print-files/`
- **Production**: Ready for Vercel Blob storage integration

### Usage

To test the file upload feature:

1. Start the dev server: `pnpm dev`
2. Create an account or log in at `/login`
3. Navigate to `/new-order`
4. Upload 3D print files via drag-and-drop or file picker
5. Files are validated, uploaded, and tracked in the PrintFiles collection
6. View uploaded files in the Payload admin at `/admin/collections/print-files`

### Phase 2: 3D File Analysis & Cost Estimation (Completed)

Automatic analysis of uploaded 3D files with real-time cost calculations:

#### Features Implemented:

**Print Settings Global** (`/admin/globals/print-settings`):
- Configurable printer specifications (Bambu X1C build volume: 256×256×256mm)
- Adjustable print settings (layer height, infill %, print speed)
- Material density configuration (default: PLA at 1.24 g/cm³)
- Pricing controls:
  - Base order fee
  - Price per gram of filament
  - Hourly machine rate
  - Minimum charge per print
- Analysis options (enable/disable automatic analysis, reject oversized files)

**File Analysis Engine**:
- STL file parsing using `node-stl` library
- Extracts:
  - Volume (mm³) for material cost calculation
  - Surface area (mm²) for support estimation
  - Bounding box dimensions (X, Y, Z in mm)
  - Triangle count for mesh quality
- Validates files fit within build volume (256×256×256mm)
- Clear error messaging for oversized files

**Cost Calculation**:
- Material cost: `volume × density × price_per_gram`
- Time cost: `estimated_hours × hourly_rate`
- Total: `base_fee + material_cost + time_cost` (minimum charge applied)
- Real-time estimation displayed in upload UI

**Background Processing**:
- Uses Payload Jobs Queue for async analysis
- Status tracking: pending → analyzing → complete/failed
- Automatic polling for analysis results
- Results stored in PrintFiles collection

**User Experience**:
- Upload shows instant feedback
- Real-time "Analyzing file..." indicator with spinner
- Displays estimated cost once analysis completes
- Clear error messages for build volume violations

#### Admin Configuration:

After initial setup, configure print settings at `/admin/globals/print-settings`:
1. Verify printer specifications match your Bambu X1C
2. Adjust pricing based on your market rates
3. Fine-tune print settings for your typical jobs
4. Enable/disable automatic analysis as needed

### Debugging & Logging

Comprehensive logging has been implemented throughout the upload and analysis pipeline to help diagnose issues:

**Log Prefixes:**
- `[Upload API]` - File upload endpoint (`/api/upload-print-file`)
- `[Analysis Job]` - Background job processing (`src/jobs/analyzeFile.ts`)
- `[STL Parser]` - STL file parsing operations
- `[FileUpload]` - Frontend upload component
- `[Print Files API]` - Status polling endpoint

**What's Logged:**

1. **Upload Flow:**
   - File received, size, and type
   - Validation results
   - Buffer creation and database operations
   - Job queue status
   - Total upload duration

2. **Analysis Flow:**
   - Job start time and parameters
   - Status updates (pending → analyzing → complete/failed)
   - File parsing progress
   - Volume and triangle count
   - Build volume constraint checks
   - Cost calculation breakdown
   - Analysis completion time

3. **Frontend Flow:**
   - File handling and local ID assignment
   - Upload requests and responses
   - Polling attempts and responses
   - Status updates
   - File removal operations

**Monitoring Analysis:**

When a file upload seems to hang:
1. Check browser console for `[FileUpload]` logs
2. Check server logs for `[Upload API]` and `[Analysis Job]` logs
3. Look for error messages or stack traces
4. Verify the analysis job was queued successfully
5. Check if the file exists at the logged file path

**Common Issues:**
- File path incorrect (check `[Analysis Job]` logs for file not found errors)
- STL parsing errors (check `[STL Parser]` logs)
- Database connection issues (check Payload initialization logs)
- Job queue not processing (verify Payload jobs configuration)

**File Replacement:**
Files can be canceled and replaced during upload. The frontend properly:
- Assigns unique IDs to prevent conflicts
- Updates from local to server IDs after upload
- Removes files from the list when canceled
- Supports multiple file uploads and removals

## Future Enhancements

The following features are planned for future implementation:

### Phase 2 Enhancements (Future):
- **Complexity Factors**: Thin wall detection, overhang analysis, support material requirements
- **Advanced 3MF Support**: Full 3MF parsing with embedded print settings using lib3mf
- **OBJ File Support**: Complete OBJ parser for Wavefront OBJ files
- **Multi-Part Files**: Handle files with multiple objects/components
- **Orientation Optimization**: Suggest optimal print orientations
- **Support Material Calculation**: Accurate support material cost estimation

### Phase 3: Enhanced Checkout (Upcoming):
- Material selection (PLA colors)
- Color selection per material type
- Multi-page checkout flow with animations
- Post-print payment completion with optional tips

### Phase 4: User Experience (Planned):
- Main landing page with prominent file upload drop zone
- Responsive design optimizations for mobile devices
- Enhanced order tracking interface

### Phase 5: Business Operations (Planned):
- SMS notifications for new orders
- Order analytics and reporting dashboard
- Customer communication system
- Status update automation

### Configuration Reminders:
- **Material Densities**: Update when adding new filament types (ABS: 1.04 g/cm³, PETG: 1.27 g/cm³, etc.)
- **Pricing Adjustments**: Review and update pricing quarterly based on filament costs and market rates
- **Print Settings**: Tune default settings based on actual print performance data
- **Build Volume**: Update if upgrading to different printer models

## Website

This template includes a beautifully designed, production-ready front-end built with the [Next.js App Router](https://nextjs.org), served right alongside your Payload app in a instance. This makes it so that you can deploy both your backend and website where you need it.

Core features:

- [Next.js App Router](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [React Hook Form](https://react-hook-form.com)
- [Payload Admin Bar](https://github.com/payloadcms/payload/tree/main/packages/admin-bar)
- [TailwindCSS styling](https://tailwindcss.com/)
- [shadcn/ui components](https://ui.shadcn.com/)
- User Accounts and Authentication
- Publication workflow
- Dark mode
- Pre-made layout building blocks
- SEO
- Search
- Live preview
- Stripe payments
- **3D Print File Upload System** (Phase 1)

### Cache

Although Next.js includes a robust set of caching strategies out of the box, Payload Cloud proxies and caches all files through Cloudflare using the [Official Cloud Plugin](https://www.npmjs.com/package/@payloadcms/payload-cloud). This means that Next.js caching is not needed and is disabled by default. If you are hosting your app outside of Payload Cloud, you can easily reenable the Next.js caching mechanisms by removing the `no-store` directive from all fetch requests in `./src/app/_api` and then removing all instances of `export const dynamic = 'force-dynamic'` from pages files, such as `./src/app/(pages)/[slug]/page.tsx`. For more details, see the official [Next.js Caching Docs](https://nextjs.org/docs/app/building-your-application/caching).

## Development

To spin up this example locally, follow the [Quick Start](#quick-start). Then [Seed](#seed) the database with a few pages, posts, and projects.

### Working with Postgres

Postgres and other SQL-based databases follow a strict schema for managing your data. In comparison to our MongoDB adapter, this means that there's a few extra steps to working with Postgres.

Note that often times when making big schema changes you can run the risk of losing data if you're not manually migrating it.

#### Local development

Ideally we recommend running a local copy of your database so that schema updates are as fast as possible. By default the Postgres adapter has `push: true` for development environments. This will let you add, modify and remove fields and collections without needing to run any data migrations.

If your database is pointed to production you will want to set `push: false` otherwise you will risk losing data or having your migrations out of sync.

#### Migrations

[Migrations](https://payloadcms.com/docs/database/migrations) are essentially SQL code versions that keeps track of your schema. When deploy with Postgres you will need to make sure you create and then run your migrations.

Locally create a migration

```bash
pnpm payload migrate:create
```

This creates the migration files you will need to push alongside with your new configuration.

On the server after building and before running `pnpm start` you will want to run your migrations

```bash
pnpm payload migrate
```

This command will check for any migrations that have not yet been run and try to run them and it will keep a record of migrations that have been run in the database.

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

### Seed

To seed the database with a few pages, products, and orders you can click the 'seed database' link from the admin panel.

The seed script will also create a demo user for demonstration purposes only:

- Demo Customer
  - Email: `customer@example.com`
  - Password: `password`

> NOTICE: seeding the database is destructive because it drops your current database to populate a fresh one from the seed template. Only run this command if you are starting a new project or can afford to lose your current data.

## Production

To run Payload in production, you need to build and start the Admin panel. To do so, follow these steps:

1. Invoke the `next build` script by running `pnpm build` or `npm run build` in your project root. This creates a `.next` directory with a production-ready admin bundle.
1. Finally run `pnpm start` or `npm run start` to run Node in production and serve Payload from the `.build` directory.
1. When you're ready to go live, see Deployment below for more details.

### Deploying to Vercel

This template can also be deployed to Vercel for free. You can get started by choosing the Vercel DB adapter during the setup of the template or by manually installing and configuring it:

```bash
pnpm add @payloadcms/db-vercel-postgres
```

```ts
// payload.config.ts
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'

export default buildConfig({
  // ...
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  // ...
```

We also support Vercel's blob storage:

```bash
pnpm add @payloadcms/storage-vercel-blob
```

```ts
// payload.config.ts
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

export default buildConfig({
  // ...
  plugins: [
    vercelBlobStorage({
      collections: {
        [Media.slug]: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
  // ...
```

### Self-hosting

Before deploying your app, you need to:

1. Ensure your app builds and serves in production. See [Production](#production) for more details.
2. You can then deploy Payload as you would any other Node.js or Next.js application either directly on a VPS, DigitalOcean's Apps Platform, via Coolify or more. More guides coming soon.

You can also deploy your app manually, check out the [deployment documentation](https://payloadcms.com/docs/production/deployment) for full details.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
