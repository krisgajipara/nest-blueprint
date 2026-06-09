import { DEFAULT_SERVICE_CATALOG } from "@core-constants";
import { Service, ServiceCategory, ServiceSkillMapping, Skill } from "@core-database";
import { EntityManager } from "typeorm";

/**
 * Seeds default service categories and sample services for a new tenant
 */
export async function seedServiceCatalogForTenant(manager: EntityManager, tenantId: string): Promise<void> {
    const skillCache = new Map<string, Skill>();

    const ensureSkill = async (skillName: string): Promise<Skill | null> => {
        const normalizedSkillName = skillName?.trim();
        if (!normalizedSkillName) {
            return null;
        }

        const cacheKey = normalizedSkillName.toLowerCase();
        const cached = skillCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const existing = await manager.findOne(Skill, {
            where: { tenantId, name: normalizedSkillName } as any
        });
        if (existing) {
            skillCache.set(cacheKey, existing);
            return existing;
        }

        const created = manager.create(Skill, {
            name: normalizedSkillName,
            description: `${normalizedSkillName} related skill`,
            isActive: true,
            tenantId
        });
        const saved = await manager.save(created);
        skillCache.set(cacheKey, saved);
        return saved;
    };

    const categorySkillMap: Record<string, string[]> = {
        Hair: ["Hair Cutting", "Hair Coloring", "Hair Styling", "Hair Treatment"],
        Beard: ["Beard Trimming", "Beard Styling"],
        Nail: ["Manicure", "Pedicure", "Nail Care"],
        "Beauty & Skin Care": ["Skin Care", "Cleanup", "De-Tan"],
        "Spa & Relaxation": ["Head Massage", "Body Spa", "Relaxation Therapy"],
        Makeup: ["Party Makeup", "Bridal Makeup", "Makeup Artistry"],
        Facial: ["Facial Therapy", "Skin Analysis"],
        Massage: ["Back Massage", "Swedish Massage", "Therapy Massage"],
        Waxing: ["Arms Waxing", "Legs Waxing", "Body Waxing"],
        "Bridal Services": ["Bridal Makeup", "Bridal Hair Styling", "Bridal Grooming"]
    };

    const serviceSkillMap: Record<string, string[]> = {
        Haircut: ["Hair Cutting", "Scissor Work"],
        "Hair Color": ["Hair Coloring", "Color Consultation"],
        "Hair Spa": ["Hair Treatment", "Scalp Therapy"],
        "Beard Trim": ["Beard Trimming"],
        "Beard Styling": ["Beard Styling"],
        Manicure: ["Manicure", "Nail Care"],
        Pedicure: ["Pedicure", "Nail Care"],
        Cleanup: ["Cleanup", "Skin Care"],
        "De-Tan": ["De-Tan", "Skin Care"],
        "Head Massage": ["Head Massage", "Relaxation Therapy"],
        "Full Body Spa": ["Body Spa", "Relaxation Therapy"],
        "Party Makeup": ["Party Makeup", "Makeup Artistry"],
        "Engagement Makeup": ["Makeup Artistry"],
        "Classic Facial": ["Facial Therapy", "Skin Analysis"],
        "Gold Facial": ["Facial Therapy", "Skin Care"],
        "Back Massage": ["Back Massage", "Therapy Massage"],
        "Swedish Massage": ["Swedish Massage", "Therapy Massage"],
        "Full Arms Wax": ["Arms Waxing", "Body Waxing"],
        "Full Legs Wax": ["Legs Waxing", "Body Waxing"],
        "Bridal Makeup": ["Bridal Makeup", "Makeup Artistry"],
        "Bridal Hair": ["Bridal Hair Styling", "Hair Styling"]
    };

    for (const categorySeed of DEFAULT_SERVICE_CATALOG) {
        const category = manager.create(ServiceCategory, {
            name: categorySeed.name,
            gender: categorySeed.gender,
            isActive: true,
            tenantId
        });
        const savedCategory = await manager.save(category);

        if (!categorySeed.services.length) {
            continue;
        }

        const services = categorySeed.services.map((serviceSeed) =>
            manager.create(Service, {
                categoryId: savedCategory.id,
                name: serviceSeed.name,
                description: serviceSeed.description ?? null,
                price: serviceSeed.price,
                durationMin: serviceSeed.durationMin,
                isActive: true,
                tenantId
            })
        );

        const savedServices = await manager.save(services);

        const categorySkills = categorySkillMap[categorySeed.name] ?? [];
        const mappingRows: ServiceSkillMapping[] = [];

        for (const [index, savedService] of savedServices.entries()) {
            const serviceSeed = categorySeed.services[index];
            const serviceSkills = serviceSkillMap[serviceSeed.name] ?? [];
            const relevantSkillNames = [...new Set([...categorySkills, ...serviceSkills])];

            for (const skillName of relevantSkillNames) {
                const skill = await ensureSkill(skillName);
                if (!skill) {
                    continue;
                }

                mappingRows.push(
                    manager.create(ServiceSkillMapping, {
                        serviceId: savedService.id,
                        skillId: skill.id,
                        tenantId
                    })
                );
            }
        }

        if (mappingRows.length > 0) {
            await manager.save(mappingRows);
        }
    }
}
