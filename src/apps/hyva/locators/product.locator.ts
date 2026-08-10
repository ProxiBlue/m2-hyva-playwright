export const title = 'h1';
export const productGrid = ".products-grid";
export const productGridItem = ".product-item";
export const productGridItemInfo = ".product-info";
export const productItemLink = ".product-item-link";

export const productItemName = ".product-item-link";

// Hyvä emits the product main final price inside `.final-price .price-wrapper .price`
// (no `.product-info-main` wrapper; that markup is Luma-only). Fall back to the
// generic finalPrice data attribute so the selector stays stable across minor
// theme variations.
export const productItemPrice = ".final-price [data-price-type='finalPrice'] .price, .final-price .price-wrapper .price";
export const productItemPriceRegular = ".price-wrapper>>.price";
export const productItemPriceSpecial = ".special-price>>.price";
export const productItemPriceOld = ".old-price>>.price";
export const productItemPriceNew = ".new-price>>.price";

export const product_qty_input = "[name='qty']";
export const product_qty_input_selector = "input[id^='qty']";
export const product_add_to_cart_button = "#product-addtocart-button";

export const product_gallery_image = "#gallery img";
export const breadcrumbs_items = ".breadcrumbs ol li";

export const addToCompare = "button[aria-label*='Add to Compare']";

export const compareLink = "#compare-link";

// Hyvä renders the PDP wishlist button as `#add-to-wishlist` with
// `aria-label="Add to Wish List"` and `data-addto="wishlist"`. The Luma
// `.product-info-main` wrapper does not exist in Hyvä, so anchoring on it
// made the selector match nothing and the PDP `addToWishlistLoggedIn` flow
// silently bailed out. Use the Hyvä id which is emitted by
// vendor/hyva-themes/.../Magento_Catalog/.../product/view/addtowishlist.phtml
export const wishlist_button = '#add-to-wishlist[data-addto="wishlist"]';
export const product_id_input = 'input[name="product"]';
export const product_sku_form = 'form[data-product-sku]';
