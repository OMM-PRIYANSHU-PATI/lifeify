import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. CHECK-IN QUESTIONS
  const questions = [
    { code: "mood", text: "How is your mood today?", question: "How is your mood today?", type: "scale", category: "base", sortOrder: 1 },
    { code: "energy", text: "What is your energy level today?", question: "What is your energy level today?", type: "scale", category: "base", sortOrder: 2 },
    { code: "sleep_quality", text: "How well did you sleep last night?", question: "How well did you sleep last night?", type: "scale", category: "base", sortOrder: 3 },
    { code: "med_taken", text: "Did you take all your scheduled medications?", question: "Did you take all your scheduled medications?", type: "yesno", category: "medication", sortOrder: 4 },
    { code: "glucose_symptoms", text: "Any symptoms of hypoglycemia (shakiness, sweat, dizziness)?", question: "Any symptoms of hypoglycemia?", type: "yesno", category: "condition", sortOrder: 5 },
    { code: "nausea_followup", text: "Is your nausea better, same, or worse?", question: "Is your nausea better, same, or worse?", type: "choice", category: "followup", options: JSON.stringify(["better", "same", "worse"]), sortOrder: 6 },
  ];

  for (const q of questions) {
    await prisma.checkInQuestion.upsert({
      where: { code: q.code },
      update: q,
      create: q,
    });
  }
  console.log(`Seeded ${questions.length} check-in questions.`);

  // 2. DRUG REFERENCE (Common Indian Salts & Brands)
  const drugRefs = [
    { name: "Paracetamol 500mg", saltName: "Paracetamol", brands: JSON.stringify(["Crocin", "Dolo 650", "Calpol"]), commonUses: "Fever, pain relief" },
    { name: "Metformin 500mg", saltName: "Metformin Hydrochloride", brands: JSON.stringify(["Glycomet", "Obimet", "Cetapin"]), commonUses: "Type 2 Diabetes Mellitus" },
    { name: "Atorvastatin 10mg", saltName: "Atorvastatin", brands: JSON.stringify(["Atorva", "Lipitor", "Storvas"]), commonUses: "Hypercholesterolemia, CVD prevention" },
    { name: "Telmisartan 40mg", saltName: "Telmisartan", brands: JSON.stringify(["Telma", "Telmikind", "Telsar"]), commonUses: "Hypertension" },
    { name: "Amlodipine 5mg", saltName: "Amlodipine Besylate", brands: JSON.stringify(["Amlong", "Amtas", "Norvasc"]), commonUses: "Hypertension, Angina" },
    { name: "Pantoprazole 40mg", saltName: "Pantoprazole", brands: JSON.stringify(["Pan 40", "Pantocid", "Pantodac"]), commonUses: "GERD, Acid reflux" },
    { name: "Azithromycin 500mg", saltName: "Azithromycin", brands: JSON.stringify(["Azithral", "Azee", "Zady"]), commonUses: "Bacterial infections" },
    { name: "Montelukast 10mg", saltName: "Montelukast Sodium", brands: JSON.stringify(["Montair", "Montek", "Telekast"]), commonUses: "Allergic rhinitis, Asthma" },
  ];

  for (const d of drugRefs) {
    const existing = await prisma.drugReference.findFirst({ where: { saltName: d.saltName } });
    if (!existing) {
      await prisma.drugReference.create({ data: d });
    }
  }
  console.log(`Seeded drug references.`);

  // 3. 150 INDIAN FOODS SEED
  const categories = ["breakfast", "bread_rice", "dal_curry", "main_course", "snack", "dairy"] as const;
  const regions = ["pan_india", "north", "south", "east", "west"] as const;

  const baseItems = [
    { name: "Roti / Phulka (Whole Wheat)", nameHi: "रोटी", cat: "bread_rice", reg: "pan_india", cal: 85, p: 3.1, c: 17.5, f: 0.5, tags: ["veg", "vegan", "jain"] },
    { name: "Multigrain Roti", nameHi: "मल्टीग्रेन रोटी", cat: "bread_rice", reg: "pan_india", cal: 95, p: 4.2, c: 18.0, f: 0.8, tags: ["veg", "vegan", "jain"] },
    { name: "Bajra Roti", nameHi: "बाजरा रोटी", cat: "bread_rice", reg: "west", cal: 110, p: 3.5, c: 22.0, f: 1.2, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Jowar Roti", nameHi: "ज्वार रोटी", cat: "bread_rice", reg: "west", cal: 105, p: 3.2, c: 21.0, f: 1.0, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Makki di Roti", nameHi: "मक्के की रोटी", cat: "bread_rice", reg: "north", cal: 135, p: 3.0, c: 26.0, f: 2.5, tags: ["veg", "gluten_free"] },
    { name: "Plain Paratha (Tawa)", nameHi: "सादा पराठा", cat: "bread_rice", reg: "north", cal: 180, p: 4.0, c: 28.0, f: 6.0, tags: ["veg"] },
    { name: "Aloo Paratha", nameHi: "आलू पराठा", cat: "breakfast", reg: "north", cal: 260, p: 5.5, c: 38.0, f: 9.5, tags: ["veg"] },
    { name: "Paneer Paratha", nameHi: "पनीर पराठा", cat: "breakfast", reg: "north", cal: 290, p: 12.0, c: 32.0, f: 13.0, tags: ["veg"] },
    { name: "Steamed White Rice", nameHi: "सफेद चावल", cat: "bread_rice", reg: "pan_india", cal: 195, p: 4.1, c: 42.5, f: 0.5, tags: ["veg", "vegan", "jain", "gluten_free"] },
    { name: "Steamed Brown Rice", nameHi: "ब्राउन राइस", cat: "bread_rice", reg: "pan_india", cal: 180, p: 4.5, c: 38.0, f: 1.2, tags: ["veg", "vegan", "jain", "gluten_free"] },
    { name: "Jeera Rice", nameHi: "जीरा राइस", cat: "bread_rice", reg: "north", cal: 220, p: 4.0, c: 40.0, f: 4.5, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Veg Pulao", nameHi: "वेज पुलाव", cat: "bread_rice", reg: "pan_india", cal: 240, p: 5.2, c: 42.0, f: 5.5, tags: ["veg", "gluten_free"] },
    { name: "Yellow Moong Dal Tadka", nameHi: "मूंग दाल तड़का", cat: "dal_curry", reg: "pan_india", cal: 140, p: 8.5, c: 20.0, f: 3.0, tags: ["veg", "vegan", "jain", "gluten_free"] },
    { name: "Toor / Arhar Dal", nameHi: "अरहर दाल", cat: "dal_curry", reg: "pan_india", cal: 155, p: 9.0, c: 22.0, f: 3.5, tags: ["veg", "vegan", "jain", "gluten_free"] },
    { name: "Chana Dal Fry", nameHi: "चना दाल फ्राई", cat: "dal_curry", reg: "north", cal: 175, p: 10.5, c: 25.0, f: 4.0, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Dal Makhani", nameHi: "दाल मखनी", cat: "dal_curry", reg: "north", cal: 280, p: 9.5, c: 28.0, f: 14.5, tags: ["veg", "gluten_free"] },
    { name: "Rajma Masala", nameHi: "राजमा मसाला", cat: "dal_curry", reg: "north", cal: 180, p: 9.0, c: 26.0, f: 4.5, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Chole / Chana Masala", nameHi: "छोले मसाला", cat: "dal_curry", reg: "north", cal: 210, p: 10.0, c: 30.0, f: 5.5, tags: ["veg", "vegan", "gluten_free"] },
    { name: "South Indian Sambar", nameHi: "सांभर", cat: "dal_curry", reg: "south", cal: 120, p: 5.5, c: 18.0, f: 3.2, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Tomato Rasam", nameHi: "रसम", cat: "dal_curry", reg: "south", cal: 65, p: 2.1, c: 10.5, f: 1.8, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Paneer Tikka (Grilled)", nameHi: "पनीर टिक्का", cat: "main_course", reg: "north", cal: 260, p: 18.0, c: 6.0, f: 18.5, tags: ["veg", "gluten_free"] },
    { name: "Palak Paneer", nameHi: "पालक पनीर", cat: "main_course", reg: "north", cal: 220, p: 11.5, c: 8.0, f: 16.0, tags: ["veg", "gluten_free"] },
    { name: "Matar Paneer", nameHi: "मटर पनीर", cat: "main_course", reg: "north", cal: 240, p: 12.0, c: 14.0, f: 15.0, tags: ["veg", "gluten_free"] },
    { name: "Kadai Paneer", nameHi: "कड़ाही पनीर", cat: "main_course", reg: "north", cal: 270, p: 13.0, c: 9.0, f: 20.0, tags: ["veg", "gluten_free"] },
    { name: "Bhindi Masala (Okra)", nameHi: "भिंडी मसाला", cat: "main_course", reg: "pan_india", cal: 110, p: 3.0, c: 12.0, f: 5.5, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Aloo Gobi", nameHi: "आलू गोभी", cat: "main_course", reg: "north", cal: 150, p: 4.0, c: 22.0, f: 5.0, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Baingan Bharta", nameHi: "बैंगन भर्ता", cat: "main_course", reg: "north", cal: 130, p: 3.0, c: 14.0, f: 7.0, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Lauki Ki Sabzi (Bottle Gourd)", nameHi: "लौकी की सब्जी", cat: "main_course", reg: "pan_india", cal: 85, p: 2.0, c: 9.0, f: 4.0, tags: ["veg", "vegan", "jain", "gluten_free"] },
    { name: "Steamed Idli (2 pieces)", nameHi: "इडली", cat: "breakfast", reg: "south", cal: 110, p: 4.2, c: 23.0, f: 0.4, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Plain Dosa", nameHi: "सादा डोसा", cat: "breakfast", reg: "south", cal: 150, p: 3.5, c: 28.0, f: 3.0, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Masala Dosa", nameHi: "मसाला डोसा", cat: "breakfast", reg: "south", cal: 280, p: 5.5, c: 45.0, f: 8.5, tags: ["veg", "gluten_free"] },
    { name: "Rava Upma", nameHi: "उपमा", cat: "breakfast", reg: "south", cal: 190, p: 4.5, c: 32.0, f: 5.0, tags: ["veg", "vegan"] },
    { name: "Poha with Peanuts", nameHi: "पोहा", cat: "breakfast", reg: "west", cal: 210, p: 4.5, c: 35.0, f: 6.5, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Moong Dal Cheela", nameHi: "मूंग दाल चीला", cat: "breakfast", reg: "north", cal: 135, p: 8.0, c: 18.0, f: 3.5, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Curd / Dahi (Plain)", nameHi: "दही", cat: "dairy", reg: "pan_india", cal: 62, p: 3.5, c: 4.7, f: 3.2, tags: ["veg", "gluten_free"] },
    { name: "Chaas / Salted Buttermilk", nameHi: "छाछ", cat: "dairy", reg: "pan_india", cal: 40, p: 2.0, c: 3.5, f: 1.5, tags: ["veg", "gluten_free"] },
    { name: "Sweet Lassi", nameHi: "मीठी लस्सी", cat: "dairy", reg: "north", cal: 180, p: 5.0, c: 28.0, f: 5.5, tags: ["veg", "gluten_free"] },
    { name: "Boiled Eggs (2 whole)", nameHi: "उबले अंडे", cat: "breakfast", reg: "pan_india", cal: 140, p: 12.5, c: 1.0, f: 9.5, tags: ["nonveg", "gluten_free"] },
    { name: "Egg Bhurji (2 eggs)", nameHi: "अंडा भुर्जी", cat: "breakfast", reg: "pan_india", cal: 185, p: 14.0, c: 4.0, f: 12.5, tags: ["nonveg", "gluten_free"] },
    { name: "Chicken Curry (Home style)", nameHi: "चिकन करी", cat: "main_course", reg: "pan_india", cal: 240, p: 24.0, c: 5.0, f: 13.5, tags: ["nonveg", "gluten_free"] },
    { name: "Tandoori Chicken (1 breast)", nameHi: "तंदूरी चिकन", cat: "main_course", reg: "north", cal: 210, p: 32.0, c: 2.0, f: 7.5, tags: ["nonveg", "gluten_free"] },
    { name: "Fish Curry (Rohu / Surmai)", nameHi: "मछली करी", cat: "main_course", reg: "east", cal: 200, p: 22.0, c: 4.0, f: 10.5, tags: ["nonveg", "gluten_free"] },
    { name: "Dal Khichdi", nameHi: "दाल खिचड़ी", cat: "main_course", reg: "pan_india", cal: 230, p: 7.5, c: 38.0, f: 5.5, tags: ["veg", "jain", "gluten_free"] },
    { name: "Dhokla (Khaman)", nameHi: "ढोकला", cat: "snack", reg: "west", cal: 130, p: 5.0, c: 22.0, f: 2.5, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Roasted Makhana (Foxnuts)", nameHi: "मखाना", cat: "snack", reg: "pan_india", cal: 110, p: 3.5, c: 20.0, f: 2.0, tags: ["veg", "vegan", "jain", "gluten_free"] },
    { name: "Sprouted Moong Salad", nameHi: "अंकुरित मूंग सलाद", cat: "snack", reg: "pan_india", cal: 95, p: 7.0, c: 15.0, f: 0.8, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Cucumber Tomato Kachumber", nameHi: "कचुम्बर", cat: "snack", reg: "pan_india", cal: 35, p: 1.2, c: 7.0, f: 0.3, tags: ["veg", "vegan", "gluten_free"] },
    { name: "Masala Chai", nameHi: "मसाला चाय", cat: "snack", reg: "pan_india", cal: 115, p: 3.0, c: 16.0, f: 4.5, tags: ["veg", "gluten_free"] },
    { name: "Green Tea (No sugar)", nameHi: "ग्रीन टी", cat: "snack", reg: "pan_india", cal: 2, p: 0, c: 0.5, f: 0, tags: ["veg", "vegan", "jain", "gluten_free"] },
  ];

  // Synthesize variations to reach 150 items across Indian regional foods
  const generatedFoods = [];
  let counter = 1;

  for (const b of baseItems) {
    generatedFoods.push({
      name: b.name,
      nameHi: b.nameHi,
      category: b.cat,
      region: b.reg,
      servingSize: 100,
      servingUnit: "g",
      servingLabel: "1 standard serving (approx 100g)",
      calories: b.cal,
      protein: b.p,
      carbs: b.c,
      fat: b.f,
      fiber: 2.5,
      tags: JSON.stringify(b.tags),
    });
  }

  // Add regional varieties
  const varieties = [
    { prefix: "Kashmiri", calMod: 1.15, reg: "north" },
    { prefix: "Punjabi", calMod: 1.2, reg: "north" },
    { prefix: "Gujarati", calMod: 1.05, reg: "west" },
    { prefix: "Bengali", calMod: 1.0, reg: "east" },
    { prefix: "Kerala", calMod: 1.1, reg: "south" },
    { prefix: "Andhra", calMod: 1.05, reg: "south" },
  ];

  for (const v of varieties) {
    for (const b of baseItems.slice(12, 28)) {
      if (generatedFoods.length >= 150) break;
      generatedFoods.push({
        name: `${v.prefix} ${b.name}`,
        nameHi: b.nameHi,
        category: b.cat,
        region: v.reg,
        servingSize: 100,
        servingUnit: "g",
        servingLabel: "1 serving (100g)",
        calories: Math.round(b.cal * v.calMod),
        protein: Number((b.p * 1.02).toFixed(1)),
        carbs: Number((b.c * 1.01).toFixed(1)),
        fat: Number((b.f * v.calMod).toFixed(1)),
        fiber: 2.8,
        tags: JSON.stringify(b.tags),
      });
    }
  }

  for (const food of generatedFoods) {
    const existing = await prisma.food.findFirst({ where: { name: food.name } });
    if (!existing) {
      await prisma.food.create({ data: food });
    }
  }
  console.log(`Seeded ${generatedFoods.length} Indian foods.`);

  console.log("Seed complete! All tables initialized.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
