# Fieldframe: a concrete route to revenue

## What is ready

The app is a free scene-first field reference. The separate **Fieldframe Complete Photographic Field Guide** is the proposed first paid product: a designed A4 PDF companion with 120 individual scene sheets, real licensed photographs, camera starting settings, focus targets, shooting steps, corrections and photographic credits.

The guide is deliberately concise. It does not claim to reproduce every explanation, alternative setup or phone-specific control in the app. It offers a convenient, coherent printable and downloadable edition of the field reference.

The six-scene public sample is `public/downloads/fieldframe-sample.pdf`. The complete saleable PDF is generated outside `public/`, outside the GitHub repository, and is delivered separately to the owner. Do not upload it to `public/`, `dist/`, a public GitHub Release or the public Pages branch if it will be sold as a privately delivered download.

## Offer to test

**Proposed launch experiment: £19 once for the complete PDF.** This is a suggested test price, not a validated market price or an active offer. No revenue, sales volume or conversion rate is promised.

The value proposition is practical: one coherent reference to save, print and carry, with direct links back to the complete scene instructions. A free six-scene sample lets a buyer judge the actual typography, content and usefulness before purchasing.

Use the completed guide pages and real app recordings in marketing. Show one specific problem and its correction, for example star trails from an overlong exposure, blurred birds or a waterfall rendered with the wrong shutter speed. Do not fabricate before/after captures or claim the example photograph was made with the displayed settings.

## Checkout and delivery

**Payments are not connected in this delivery.** There is no fake buy button, simulated successful payment, invented subscription or client-side premium unlock.

The shortest launch route is a merchant account that supports hosted checkout and digital-file delivery. The owner supplies the seller identity, payout connection, product price, customer contact details and refund terms. Upload the complete PDF to that merchant's protected delivery system. Create a real product and test the checkout and post-purchase download in the provider's test mode before connecting its public checkout URL.

The checkout provider should process payment and deliver the PDF. Do not handle card data in the app. A simple app link to that checkout should exist only when the destination is configured and verified. If a primary sales landing page is deployed, use commercial-capable hosting.

A user who buys a PDF can still redistribute it. Hosted delivery protects the initial download from being public; it is not DRM and should not be marketed as copy-proof.

## GitHub repository and hosting

Keep the existing source repository public, as requested. Public code and bundled scene data can be inspected and copied; a JavaScript flag or localStorage value cannot secure paid content. Selling convenience and the prepared printable edition is the intended initial offer. If exclusivity becomes the core value proposition, premium content requires authenticated server delivery and a suitable licence strategy.

GitHub's current Pages limits say Pages must not be used to run an online business, ecommerce site or a website primarily facilitating commercial transactions or commercial SaaS. Keep the Pages deployment a free reference/demo and host the actual commercial storefront and checkout on a platform that allows them. Do not turn the Pages app into the main paid SaaS product.

Source, reviewed 30 October 2026: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Release decisions still required

1. Choose and connect the real merchant account and upload the complete PDF there.
2. Confirm the tested selling price, refund/customer-contact information and seller identity.
3. Test actual checkout, paid delivery, receipt and a failed/cancelled transaction.
4. Publish the commercial offer on suitable hosting, then connect the verified destination.

No extra learning sequence, quiz or account wall is needed for the free scene library. Improve the product by observing which scenes people search for, where they struggle and whether the paid companion provides enough convenience to buy. Any analytics should be a deliberate later addition with appropriate disclosure; no tracker has been added for this proposal.

## Regenerate the guide

Run `python scripts/build-field-guide.py` after the photo manifest and assets are complete. It validates the 120 unique scene IDs, measures page layouts, fails on overflow, checks scene safety text after PDF extraction and writes the complete guide to the sibling `deliverables/` directory. The six-scene sample remains in `public/downloads/` for the app. Render representative pages and inspect them after any content or template change.

The generator uses Pillow, ReportLab, pypdf and Liberation Sans. Photographic credits are taken directly from `src/photo-manifest.json`; preserve each creator, source and licence when reusing or editing the guide.
