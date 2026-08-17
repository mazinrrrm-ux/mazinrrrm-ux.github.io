const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// عنوان محفظتك على شبكة ترون (TRC20)
const MY_WALLET = "TD52wwEx1yW26BzFkKM5pqdvpACgffKDzg";

// نقطة فحص البلوكشين التلقائية
app.post('/api/verify-payment', async (req, res) => {
    const { txid, expectedAmount } = req.body;

    if (!txid) {
        return res.status(400).json({ success: false, message: "يرجى إدخال رقم المعاملة (TxID)" });
    }

    try {
        // الاستعلام عن آخر المعاملات للمحفظة عبر TronGrid
        const response = await axios.get(`https://api.trongrid.io/v1/accounts/${MY_WALLET}/transactions/trc20?limit=20`);
        const transactions = response.data.data;

        // مطابقة الـ TxID والمبلغ والمستلم
        const match = transactions.find(tx => 
            tx.transaction_id === txid &&
            tx.to === MY_WALLET &&
            (parseFloat(tx.value) / 1000000) >= parseFloat(expectedAmount)
        );

        if (match) {
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

// إتاحة ملف الـ HTML للعرض المباشر عبر السيرفر
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));