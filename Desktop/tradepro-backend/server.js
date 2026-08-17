const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const MY_WALLET = "TD52wwEx1yW26BzFkKM5pqdvpACgffKDzg";

// بيانات بوت تلجرام الخاصة بك
const TELEGRAM_BOT_TOKEN = "8835838949:AAFGZfnMF6X_k6ksxQdk9PHCwVXRJdmgNSU"; 
const TELEGRAM_CHAT_ID = "6588373907";

// دالة إرسال التنبيه لتلجرام
async function sendTelegramAlert(txid, amount) {
    const message = `🚨 *عملية دفع جديدة وتفعيل VIP!* \n\n💰 *المبلغ:* $${amount} USDT\n🔗 *رقم المعاملة (TxID):*\n\`${txid}\`\n\n✅ تم التحقق والتفعيل تلقائياً عبر البلوكشين.`;
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    } catch (err) {
        console.error("فشل إرسال تنبيه تلجرام", err);
    }
}

app.post('/api/verify-payment', async (req, res) => {
    const { txid, expectedAmount } = req.body;

    if (!txid) {
        return res.status(400).json({ success: false, message: "يرجى إدخال رقم المعاملة (TxID)" });
    }

    try {
        const response = await axios.get(`https://api.trongrid.io/v1/accounts/${MY_WALLET}/transactions/trc20?limit=20`);
        const transactions = response.data.data;

        const match = transactions.find(tx => 
            tx.transaction_id === txid &&
            tx.to === MY_WALLET &&
            (parseFloat(tx.value) / 1000000) >= parseFloat(expectedAmount)
        );

        if (match) {
            // إرسال تنبيه فور التحقق
            await sendTelegramAlert(txid, expectedAmount);

            return res.json({ 
                success: true, 
                message: "تم التحقق من الدفع وتفعيل الاشتراك بنجاح! ⚡" 
            });
        } else {
            return res.json({ 
                success: false, 
                message: "لم يتم العثور على العملية بعد، تأكد من الـ TxID أو انتظر دقيقة لتأكيد الشبكة." 
            });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "خطأ أثناء الاتصال بالبلوكشين." });
    }
});

app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));