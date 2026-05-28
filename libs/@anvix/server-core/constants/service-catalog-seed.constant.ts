import { ServiceGenderEnum } from "@core-enums";

export interface ServiceCatalogSeedService {
    name: string;
    description?: string;
    price: number;
    durationMin: number;
}

export interface ServiceCatalogSeedCategory {
    name: string;
    gender: ServiceGenderEnum;
    services: ServiceCatalogSeedService[];
}

/**
 * Default salon service catalog seeded for each new tenant
 */
export const DEFAULT_SERVICE_CATALOG: ServiceCatalogSeedCategory[] = [
    {
        name: "Hair",
        gender: ServiceGenderEnum.UNISEX,
        services: [
            { name: "Haircut", description: "Standard haircut", price: 500, durationMin: 30 },
            { name: "Hair Color", description: "Full hair coloring", price: 1500, durationMin: 90 },
            { name: "Hair Spa", description: "Relaxing hair spa treatment", price: 800, durationMin: 45 }
        ]
    },
    {
        name: "Beard",
        gender: ServiceGenderEnum.MALE,
        services: [
            { name: "Beard Trim", description: "Beard shaping and trim", price: 200, durationMin: 15 },
            { name: "Beard Styling", description: "Premium beard styling", price: 350, durationMin: 20 }
        ]
    },
    {
        name: "Nail",
        gender: ServiceGenderEnum.UNISEX,
        services: [
            { name: "Manicure", description: "Hand nail care", price: 400, durationMin: 30 },
            { name: "Pedicure", description: "Foot nail care", price: 500, durationMin: 40 }
        ]
    },
    {
        name: "Beauty & Skin Care",
        gender: ServiceGenderEnum.FEMALE,
        services: [
            { name: "Cleanup", description: "Basic skin cleanup", price: 600, durationMin: 30 },
            { name: "De-Tan", description: "De-tanning treatment", price: 700, durationMin: 35 }
        ]
    },
    {
        name: "Spa & Relaxation",
        gender: ServiceGenderEnum.UNISEX,
        services: [
            { name: "Head Massage", description: "Relaxing head massage", price: 400, durationMin: 20 },
            { name: "Full Body Spa", description: "Full body relaxation spa", price: 2000, durationMin: 90 }
        ]
    },
    {
        name: "Makeup",
        gender: ServiceGenderEnum.FEMALE,
        services: [
            { name: "Party Makeup", description: "Party occasion makeup", price: 1200, durationMin: 45 },
            { name: "Engagement Makeup", description: "Engagement occasion makeup", price: 2500, durationMin: 60 }
        ]
    },
    {
        name: "Facial",
        gender: ServiceGenderEnum.UNISEX,
        services: [
            { name: "Classic Facial", description: "Classic facial treatment", price: 800, durationMin: 40 },
            { name: "Gold Facial", description: "Premium gold facial", price: 1200, durationMin: 50 }
        ]
    },
    {
        name: "Massage",
        gender: ServiceGenderEnum.UNISEX,
        services: [
            { name: "Back Massage", description: "Back and shoulder massage", price: 600, durationMin: 30 },
            { name: "Swedish Massage", description: "Swedish full body massage", price: 1500, durationMin: 60 }
        ]
    },
    {
        name: "Waxing",
        gender: ServiceGenderEnum.FEMALE,
        services: [
            { name: "Full Arms Wax", description: "Full arms waxing", price: 400, durationMin: 25 },
            { name: "Full Legs Wax", description: "Full legs waxing", price: 600, durationMin: 35 }
        ]
    },
    {
        name: "Bridal Services",
        gender: ServiceGenderEnum.FEMALE,
        services: [
            { name: "Bridal Makeup", description: "Complete bridal makeup", price: 5000, durationMin: 120 },
            { name: "Bridal Hair", description: "Bridal hairstyle", price: 3500, durationMin: 90 }
        ]
    }
];
