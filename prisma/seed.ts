import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const menuData = [
  {
    name: "Донеры",
    items: [
      { name: "В лаваше с говядиной", description: "Говядина, овощи, соус, картофель фри", price: 1790 },
      { name: "В лаваше с курицей", description: "Курица, овощи, соус, картофель фри", price: 1590 },
      { name: "В батоне с говядиной", description: "Говядина, овощи, соус, картофель фри", price: 1790 },
      { name: "В батоне с курицей", description: "Курица, овощи, соус, картофель фри", price: 1590 },
      { name: "Сырный донер с говядиной", description: "Говядина, сыр, овощи, фирменный соус", price: 1990 },
      { name: "Сырный донер с курицей", description: "Курица, сыр, овощи, фирменный соус", price: 1890 },
      { name: "Ассорти в лаваше", description: "Микс мяса, овощи, соус, картофель фри", price: 1690 },
      { name: "Ассорти в батоне", description: "Микс мяса, овощи, соус, картофель фри", price: 1690 },
    ],
  },
  {
    name: "Бургеры",
    items: [
      { name: "Бургер с говядиной", description: "Говяжья котлета, салат, сыр, соус", price: 1290 },
      { name: "Бургер с курицей", description: "Куриная котлета, салат, соус", price: 1090 },
      { name: "Чизбургер с говядиной", description: "Говядина, двойной сыр, салат, соус", price: 1490 },
      { name: "Чизбургер с курицей", description: "Курица, двойной сыр, салат, соус", price: 1390 },
    ],
  },
  {
    name: "Хот-доги",
    items: [
      { name: "Хот-дог в лаваше двойной", description: "Две сосиски в лаваше с соусом", price: 850 },
      { name: "Хот-дог в лаваше тройной", description: "Три сосиски в лаваше с соусом", price: 950 },
    ],
  },
  {
    name: "Пита",
    items: [
      { name: "Пита большая с говядиной", description: "Большая пита, говядина, овощи, соус", price: 1190 },
      { name: "Пита маленькая с говядиной", description: "Пита, говядина, овощи, соус", price: 940 },
      { name: "Пита большая с курицей", description: "Большая пита, курица, овощи, соус", price: 1090 },
      { name: "Пита маленькая с курицей", description: "Пита, курица, овощи, соус", price: 840 },
    ],
  },
  {
    name: "Гарниры",
    items: [
      { name: "Картошка фри + соус", description: "Хрустящий картофель фри с соусом на выбор", price: 790 },
    ],
  },
  {
    name: "Напитки",
    items: [
      { name: "Coca-Cola 0.5 л", description: "Coca-Cola", price: 650 },
      { name: "Coca-Cola 1 л", description: "Coca-Cola", price: 790 },
      { name: "Вода Tassay 0.5 л", description: "Минеральная вода Tassay", price: 450 },
      { name: "Вода Tassay 1 л", description: "Минеральная вода Tassay", price: 590 },
      { name: "Мохито", description: "Освежающий мохито", price: 590 },
      { name: "Gorilla", description: "Энергетический напиток Gorilla", price: 750 },
      { name: "Pepsi", description: "Pepsi", price: 790 },
      { name: "Piko", description: "Piko", price: 850 },
      { name: "Айран", description: "Освежающий айран", price: 350 },
      { name: "Maxi Чай 0.5 л", description: "Maxi Чай", price: 550 },
      { name: "Maxi Чай 1 л", description: "Maxi Чай", price: 750 },
    ],
  },
];

async function main() {
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.orderPushSubscription.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.address.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.pickupLocation.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const partner = await prisma.user.create({
    data: {
      email: "partner@test.ru",
      name: "Мария Ресторан",
      passwordHash,
      role: "RESTAURANT_OWNER",
    },
  });

  const restaurant = await prisma.restaurant.create({
    data: {
      slug: "termiz",
      name: "Termiz",
      description:
        "Фастфуд Termiz — донеры, пита, бургеры и хот-доги. Быстро, сытно, с доставкой.",
      rating: 4.9,
      deliveryTime: 25,
      pickupTime: 15,
      minOrder: 1500,
      isOpen: true,
      allowPreorders: true,
      lastOrderLeadMinutes: 30,
      timezone: "Asia/Almaty",
      workSchedule: JSON.stringify([
        { dayOfWeek: 0, isClosed: false, openTime: "10:00", closeTime: "22:00", lastOrderTime: "21:30" },
        { dayOfWeek: 1, isClosed: false, openTime: "10:00", closeTime: "22:00", lastOrderTime: "21:30" },
        { dayOfWeek: 2, isClosed: false, openTime: "10:00", closeTime: "22:00", lastOrderTime: "21:30" },
        { dayOfWeek: 3, isClosed: false, openTime: "10:00", closeTime: "22:00", lastOrderTime: "21:30" },
        { dayOfWeek: 4, isClosed: false, openTime: "10:00", closeTime: "23:00", lastOrderTime: "22:30" },
        { dayOfWeek: 5, isClosed: false, openTime: "10:00", closeTime: "23:00", lastOrderTime: "22:30" },
        { dayOfWeek: 6, isClosed: false, openTime: "10:00", closeTime: "22:00", lastOrderTime: "21:30" },
      ]),
      ownerId: partner.id,
    },
  });

  await prisma.pickupLocation.createMany({
    data: [
      {
        name: "Катаева",
        address: "ул. Катаева, 66",
        sortOrder: 0,
        restaurantId: restaurant.id,
      },
      {
        name: "Назарбаева",
        address: "пр. Назарбаева, 48/3",
        sortOrder: 1,
        restaurantId: restaurant.id,
      },
    ],
  });

  for (const [catIndex, category] of menuData.entries()) {
    const createdCategory = await prisma.menuCategory.create({
      data: {
        name: category.name,
        sortOrder: catIndex,
        restaurantId: restaurant.id,
      },
    });

    for (const [itemIndex, item] of category.items.entries()) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          sortOrder: itemIndex,
          categoryId: createdCategory.id,
          imageUrl:
            catIndex === 0 && itemIndex === 0
              ? "https://images.unsplash.com/photo-1529006557810-274db1b01333?w=400&q=80"
              : catIndex === 0 && itemIndex === 1
                ? "https://images.unsplash.com/photo-1562967962-0993e3b6c8df?w=400&q=80"
                : null,
        },
      });
    }
  }

  await prisma.promoCode.createMany({
    data: [
      {
        code: "TERMIZ10",
        discountType: "PERCENT",
        discountValue: 10,
        minOrder: 1500,
        restaurantId: restaurant.id,
      },
      {
        code: "WELCOME500",
        discountType: "FIXED",
        discountValue: 500,
        minOrder: 2000,
        restaurantId: restaurant.id,
      },
    ],
  });

  console.log("Seed completed:");
  console.log(`  Partner:  partner@test.ru / password123`);
  console.log(`  Promos:   TERMIZ10 (−10%), WELCOME500 (−500 ₸)`);
  console.log(`  Restaurant: ${restaurant.name} (${restaurant.slug})`);
  console.log(`  Prices in KZT (₸)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
