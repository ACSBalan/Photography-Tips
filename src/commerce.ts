/** A checkout is activated only when the owner supplies a real merchant URL.
 * Keep purchased files in merchant-controlled delivery, never in public/.
 * Use commercial-capable hosting before enabling a sales-oriented site.
 */
export const guideOffer = {
  checkoutUrl: '',
  priceLabel: '',
  merchantName: '',
};
export function checkoutHref(offer=guideOffer, hostname=window.location.hostname):string|null {
  if(hostname==='github.io'||hostname.endsWith('.github.io'))return null;
  if(!offer.priceLabel.trim()||!offer.merchantName.trim())return null;
  try{const url=new URL(offer.checkoutUrl);if(url.protocol!=='https:'||url.username||url.password)return null;return url.href;}catch{return null;}
}
