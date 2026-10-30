import { describe, it, expect } from 'vitest';
import { checkoutHref, guideOffer } from '../src/commerce';
describe('Honest commercial activation',()=>{
 const real={checkoutUrl:'https://merchant.example/fieldframe',priceLabel:'£19',merchantName:'Merchant'};
 it('does not expose a checkout until a real offer is configured',()=>{expect(checkoutHref(guideOffer,'fieldframe.example')).toBeNull();expect(checkoutHref({...real,priceLabel:''},'fieldframe.example')).toBeNull();expect(checkoutHref({...real,merchantName:''},'fieldframe.example')).toBeNull();});
 it('keeps commerce off GitHub Pages',()=>{expect(checkoutHref(real,'acsbalan.github.io')).toBeNull();expect(checkoutHref(real,'github.io')).toBeNull();});
 it('only permits HTTPS destinations without embedded credentials',()=>{expect(checkoutHref(real,'fieldframe.example')).toBe(real.checkoutUrl);expect(checkoutHref({...real,checkoutUrl:'javascript:alert(1)'},'fieldframe.example')).toBeNull();expect(checkoutHref({...real,checkoutUrl:'https://user:secret@merchant.example'},'fieldframe.example')).toBeNull();});
});
