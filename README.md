# Home Design

A responsive furniture and home decor storefront built for a local business in Tamra, Israel. The application brings together a customer storefront, checkout, and an admin dashboard for managing products, orders, and delivery areas.

**Live site:** [Home Design](https://home-design-pi-hazel.vercel.app)

## What I built

- Product catalog with categories, product pages, image galleries, variants, sale prices, and stock availability.
- Shopping cart and checkout with delivery or in-store pickup. Delivery fees are calculated by city and shipping region.
- PostgreSQL order function that validates products, prices, delivery fees, and stock on the server, then creates the order and updates inventory in one transaction.
- Inventory restoration when an order is cancelled, including products with variants.
- Admin tools to manage products, orders, order status, and delivery regions.
- Contact form and email notifications for new inquiries and orders.
- Responsive Hebrew, right-to-left interface.

## Tech stack

**Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS  
**Backend and database:** Supabase, PostgreSQL, Row Level Security  
**Email and hosting:** Resend, Vercel

## Current status

The storefront accepts orders, but **online card payment is not connected yet**. Placing an order does not charge the customer. Online payment integration and the site's terms are planned before the full public launch.

## Running locally

1. Install dependencies with `npm install`.
2. Configure your own Supabase project and the server environment variables needed for notifications. The application requires the corresponding tables, policies, SQL functions, and triggers in Supabase.
3. Create `.env.local` with your own configuration. Do not commit this file or any credentials.
4. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

## Author

Built by Ameer Hijazi, Software Engineering student.
