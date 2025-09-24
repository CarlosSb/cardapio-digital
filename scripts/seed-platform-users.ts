import { sql } from "@/lib/db"

async function main() {
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim()).filter(Boolean)
  const superAdmins = (process.env.SUPER_ADMIN_EMAILS || "").split(",").map(s => s.trim()).filter(Boolean)

  const toSeed = [
    ...admins.map(email => ({ email, role: "admin" })),
    ...superAdmins.map(email => ({ email, role: "super_admin" })),
  ]
    .filter((v, i, a) => a.findIndex(x => x.email.toLowerCase() === v.email.toLowerCase()) === i)

  if (toSeed.length === 0) {
    console.log("No ADMIN_EMAILS or SUPER_ADMIN_EMAILS provided. Skipping.")
    return
  }

  for (const { email, role } of toSeed) {
    try {
      await sql`
        INSERT INTO platform_users (email, role, name)
        VALUES (${email}, ${role}, ${email})
        ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, updated_at = NOW()
      `
      console.log(`Seeded platform_user: ${email} (${role})`)
    } catch (err) {
      console.error(`Failed to seed ${email}:`, err)
    }
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err)
  process.exit(1)
})


