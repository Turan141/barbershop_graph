"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const SEED_BARBERS = [
    {
        id: "b1",
        name: 'Alex "The Blade" Johnson',
        email: "alex@barber.com",
        role: "barber",
        avatarUrl: "https://images.unsplash.com/photo-1580518337843-f959e992563b?auto=format&fit=crop&q=80&w=300",
        specialties: ["Fade", "Saqqal Düzəltmə", "Klassik Kəsim"],
        rating: 4.9,
        reviewCount: 124,
        location: "Mərkəz, Bakı",
        bio: "10 illik təcrübəyə malik usta bərbər. Klassik kəsimlər və müasir fade üzrə ixtisaslaşmışdır.",
        tier: "vip",
        portfolio: [
            "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=300",
            "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=300",
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300"
        ],
        services: [
            { id: "s1", name: "Klassik Saç Kəsimi", duration: 45, price: 35, currency: "AZN" },
            { id: "s2", name: "Saqqal Düzəltmə", duration: 30, price: 25, currency: "AZN" },
            {
                id: "s_kids",
                name: "Uşaq Saçı Kəsimi",
                duration: 30,
                price: 20,
                currency: "AZN"
            },
            {
                id: "s3",
                name: "VIP Xidmət (Saç + Saqqal + Üz Baxımı)",
                duration: 90,
                price: 80,
                currency: "AZN"
            }
        ],
        schedule: {
            Monday: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
            Tuesday: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
            Wednesday: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
            Thursday: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
            Friday: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
        }
    },
    {
        id: "b2",
        name: "Sarah Styles",
        email: "sarah@barber.com",
        role: "barber",
        avatarUrl: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=300",
        specialties: ["Rəngləmə", "Stilləşdirmə", "Uzun Saç"],
        rating: 4.9,
        reviewCount: 89,
        location: "Yasamal, Bakı",
        bio: "Rəng və tekstura ilə eksperiment etməyi sevən yaradıcı stilist.",
        tier: "vip",
        portfolio: [
            "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=300",
            "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=300"
        ],
        services: [
            { id: "s4", name: "Saç Kəsimi və Stil", duration: 60, price: 50, currency: "AZN" },
            { id: "s5", name: "Saç Rəngləmə", duration: 120, price: 120, currency: "AZN" },
            { id: "s5b", name: "Keratin Baxımı", duration: 150, price: 150, currency: "AZN" }
        ],
        schedule: {
            Wednesday: ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00"],
            Thursday: ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00"],
            Friday: ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "18:00"],
            Saturday: ["10:00", "11:00", "12:00", "13:00", "14:00"]
        }
    },
    {
        id: "b3",
        name: 'Mike "The Clipper" Ross',
        email: "mike@barber.com",
        role: "barber",
        avatarUrl: "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&q=80&w=300",
        specialties: ["Maşınla Kəsim", "Təraş"],
        rating: 4.5,
        reviewCount: 45,
        location: "Gənclik, Bakı",
        bio: "Sürətli, təmiz və peşəkar. Şəhərdə ən yaxşı maşınla kəsim.",
        tier: "standard",
        portfolio: [
            "https://images.unsplash.com/photo-1593702295094-aea22597af65?auto=format&fit=crop&q=80&w=300",
            "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&q=80&w=300"
        ],
        services: [
            { id: "s6", name: "Maşınla Kəsim", duration: 30, price: 20, currency: "AZN" },
            { id: "s7", name: "Təraş", duration: 30, price: 15, currency: "AZN" }
        ],
        schedule: {
            Monday: [
                "10:00",
                "11:00",
                "12:00",
                "13:00",
                "14:00",
                "15:00",
                "16:00",
                "17:00",
                "18:00"
            ],
            Tuesday: [
                "10:00",
                "11:00",
                "12:00",
                "13:00",
                "14:00",
                "15:00",
                "16:00",
                "17:00",
                "18:00"
            ],
            Wednesday: [
                "10:00",
                "11:00",
                "12:00",
                "13:00",
                "14:00",
                "15:00",
                "16:00",
                "17:00",
                "18:00"
            ],
            Thursday: [
                "10:00",
                "11:00",
                "12:00",
                "13:00",
                "14:00",
                "15:00",
                "16:00",
                "17:00",
                "18:00"
            ],
            Friday: [
                "10:00",
                "11:00",
                "12:00",
                "13:00",
                "14:00",
                "15:00",
                "16:00",
                "17:00",
                "18:00"
            ]
        }
    }
];
const SEED_USERS = [
    {
        id: "u1",
        name: "John Doe",
        email: "client@test.com",
        role: "client",
        avatarUrl: "https://ui-avatars.com/api/?name=John+Doe&background=random"
    },
    {
        id: "u2",
        name: "Jane Smith",
        email: "jane@test.com",
        role: "client",
        avatarUrl: "https://ui-avatars.com/api/?name=Jane+Smith&background=random"
    }
];
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Start seeding ...");
        // Seed Users
        for (const u of SEED_USERS) {
            const user = yield prisma.user.upsert({
                where: { email: u.email },
                update: {},
                create: {
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    avatarUrl: u.avatarUrl
                }
            });
            console.log(`Created user with id: ${user.id}`);
        }
        // Seed Barbers (User + Profile + Services)
        for (const b of SEED_BARBERS) {
            // 1. Create User for Barber
            const user = yield prisma.user.upsert({
                where: { email: b.email },
                update: {},
                create: {
                    id: b.id + "_user", // e.g. b1_user
                    name: b.name,
                    email: b.email,
                    role: "barber",
                    avatarUrl: b.avatarUrl
                }
            });
            // 2. Create Barber Profile
            const profile = yield prisma.barberProfile.upsert({
                where: { userId: user.id },
                update: {},
                create: {
                    id: b.id,
                    userId: user.id,
                    specialties: JSON.stringify(b.specialties),
                    rating: b.rating,
                    reviewCount: b.reviewCount,
                    location: b.location,
                    bio: b.bio,
                    tier: b.tier,
                    portfolio: JSON.stringify(b.portfolio),
                    schedule: JSON.stringify(b.schedule),
                    services: {
                        create: b.services.map((s) => ({
                            id: s.id,
                            name: s.name,
                            duration: s.duration,
                            price: s.price,
                            currency: s.currency
                        }))
                    }
                }
            });
            console.log(`Created barber profile with id: ${profile.id}`);
        }
        console.log("Seeding finished.");
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
