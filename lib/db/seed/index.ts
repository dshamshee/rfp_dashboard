import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { db } from '../index';
import { tenderTable } from '../schema';

const clients = [
  "National Highways Authority of India (NHAI)",
  "Indian Railways (Northern Zone)",
  "Central Public Works Department (CPWD)",
  "Mumbai Metropolitan Region Development Authority (MMRDA)",
  "Indian Institute of Agricultural Biotechnology",
  "Oil and Natural Gas Corporation (ONGC)",
  "Bharat Heavy Electricals Limited (BHEL)",
  "Karnataka State Electronics Development Corp (KEONICS)",
  "Gujarat State Electricity Corporation",
  "Delhi Metro Rail Corporation (DMRC)",
  "State Bank of India (IT Dept)",
  "Defense Research and Development Organisation (DRDO)",
];

const tenderTitles = [
  "Supply & Commissioning of High Performance GPU Servers",
  "Construction of 4-Lane Flyover & Access Roads",
  "Annual Maintenance Contract for Enterprise ERP Network",
  "Installation of Solar PV Power Systems (5MW Ground Mounted)",
  "Implementation of Smart City Command & Control Center",
  "Procurement of Specialized Medical Diagnostic Equipment",
  "Design and Development of Cloud-Based Portal Infrastructure",
  "Railway Signaling & Telecommunication System Modernization",
  "Supply of Laptops & Workstations for Educational Institutes",
  "Facility Management & Security Services for Data Centers",
];

const locations = [
  "MAHARASHTRA",
  "JHARKHAND",
  "DELHI",
  "KARNATAKA",
  "GUJARAT",
  "TELANGANA",
  "TAMIL NADU",
  "WEST BENGAL",
  "UTTAR PRADESH",
];

const responsiblePersons = [
  "Rajesh Kumar",
  "Priya Sharma",
  "Amit Patel",
  "Danish Shamshee",
  "Anil Verma",
  "Sneha Gupta",
];

async function seed() {
  console.log("🌱 Seeding sample tenders into database...");

  const mockTenders = Array.from({ length: 15 }, () => {
    const tenderVal = faker.number.int({ min: 1000000, max: 80000000 });
    const emdVal = Math.round(tenderVal * 0.02);
    const feeVal = faker.helpers.arrayElement([2500, 5000, 10000, 25000]);
    const ourQuot = Math.round(tenderVal * faker.number.float({ min: 0.9, max: 1.05 }));
    const marginPct = Number(faker.number.float({ min: 5, max: 20 }).toFixed(1));
    const marginRs = Math.round((ourQuot * marginPct) / 100);

    const now = new Date();
    const pubDate = new Date(now.getTime() - faker.number.int({ min: 15, max: 45 }) * 86400000);
    const preDate = new Date(pubDate.getTime() + faker.number.int({ min: 3, max: 10 }) * 86400000);
    const subDate = new Date(preDate.getTime() + faker.number.int({ min: 5, max: 10 }) * 86400000);
    const lastDate = new Date(subDate.getTime() + faker.number.int({ min: 2, max: 5 }) * 86400000);
    const openDate = new Date(lastDate.getTime() + faker.number.int({ min: 1, max: 3 }) * 86400000);
    const expResult = new Date(openDate.getTime() + faker.number.int({ min: 15, max: 45 }) * 86400000);

    return {
      tenderId: `GEM/${now.getFullYear()}/B/${faker.number.int({ min: 1000000, max: 9999999 })}`,
      title: faker.helpers.arrayElement(tenderTitles),
      client: faker.helpers.arrayElement(clients),
      location: faker.helpers.arrayElement(locations),
      tenderValue: tenderVal,
      emd: emdVal,
      tenderFee: feeVal,
      publishDate: pubDate,
      preBidDate: preDate,
      lastDate: lastDate,
      openingDate: openDate,
      stage: faker.helpers.arrayElement(["Pre-Bid", "Technical Evaluation", "Financial Opening", "Awarded", "Under Review"]),
      priority: faker.helpers.arrayElement(["HIGH", "MEDIUM", "LOW"]),
      eligibility: faker.helpers.arrayElement(["ELIGIBLE", "NOT ELIGIBLE"]),
      technicalStatus: faker.helpers.arrayElement(["Qualified", "Pending Review", "Under Clarification"]),
      commercialStatus: faker.helpers.arrayElement(["L1 Bidder", "L2 Bidder", "Pending Opening"]),
      emdStatus: faker.helpers.arrayElement(["Deposited via BG", "Exempted (MSE)", "Online Payment"]),
      isBidSubmitted: faker.datatype.boolean(),
      submissionDate: subDate,
      expectedResultDate: expResult,
      awardStatus: faker.helpers.arrayElement(["In Progress", "Awarded to Us", "Lost", "Under Evaluation"]),
      competitor: faker.company.name(),
      ourQuotation: ourQuot,
      expectedMargin: marginPct,
      expectedMarginRupees: marginRs,
      responsiblePerson: faker.helpers.arrayElement(responsiblePersons),
      partner: faker.company.name(),
      nextAction: faker.helpers.arrayElement(["Submit EMD BG", "Prepare Technical Deck", "Attend Pre-bid Meeting", "Submit Clarification Response"]),
      nextActionDate: new Date(now.getTime() + faker.number.int({ min: 2, max: 14 }) * 86400000),
      remarks: faker.lorem.sentence(),
    };
  });

  await db.insert(tenderTable).values(mockTenders);
  console.log(`✅ Successfully seeded ${mockTenders.length} sample tenders!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
