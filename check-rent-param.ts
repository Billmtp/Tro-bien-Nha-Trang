async function checkRentParam() {
  const url1 = "https://gateway.chotot.com/v1/public/ad-listing?region=7&area=44&st=u&limit=10";
  const r1 = await fetch(url1);
  const d1 = await r1.json();
  console.log("With st=u:");
  d1.ads?.slice(0, 5).forEach((a: any) => {
    console.log(`- ${a.subject} | ${a.price_string} | type: ${a.type} | cat: ${a.category_name}`);
  });
}
checkRentParam();
