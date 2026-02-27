import nodemailer from "nodemailer"
import "dotenv/config"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import handlebars from "handlebars"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const verifyMail = async (token, email) => {
    try {
        const emailTemplateSource = fs.readFileSync(
            path.join(__dirname, "template.hbs"),
            "utf-8"
        )

        const template = handlebars.compile(emailTemplateSource)
        const htmlToSend = template({
            token: encodeURIComponent(token),
        })

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // APP PASSWORD
            },
        })

        const mailConfigurations = {
            from: `"Notepad App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Email Verification",
            html: htmlToSend,
        }

        const info = await transporter.sendMail(mailConfigurations)
        console.log("✅ Email sent:", info.messageId)

        return true
    } catch (error) {
        console.error("❌ Email send failed:", error.message)
        return false
    }
}
