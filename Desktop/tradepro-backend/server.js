const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// عنوان المحفظة الخاص بك للتأكيد
const MY_WALLET = "TD52wwEx1yW26BzFkKM5pqdvpACgffKDzg";

// بيانات التليجرام (يُفضل دائماً وضع التوكن في متغيرات البيئة process.env)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8835838949:AAFGZfnMF6X_k6ksxQdk9PHCwVXRJdmgNSU"; 
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "6588373907";

// دالة إرسال إشعار الدفع إلى التليجرام الخاص بك مباشرة
async function sendTelegramAlert(details) {
    const message = `🚨 *طلب اشتراك جديد (دفع مباشر)!* \n\n👛 *المحفظة:* \`${MY_WALLET}\`\n💬 *معلومات العميل:* ${details || 'تم طلب التأكيد من الموقع'}\n\n📌 يرجى مراجعة المحفظة وتفعيل الاشتراك للعميل.`;
    
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (err) {
        console.error("فشل إرسال تنبيه تلجرام:", err.message);
    }
}

// مسار الدفع المباشر (عندما يضغط العميل على تأكيد الدفع في الموقع)
app.post('/api/verify-payment', async (req, res) => {
    const { note } = req.body;

    try {
        // إرسال إشعار فوري للتليجرام بأن هناك عميل يدفع الآن
        await sendTelegramAlert(note);

        return res.json({ 
            success: true, 
            message: "تم إرسال طلب الاشتراك بنجاح! سيتم التفعيل فور تأكيد التحويل.",
            wallet: MY_WALLET
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً." 
        });
    }
});

app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));