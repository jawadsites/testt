# إعداد Cloudinary لتخزين الصور

## لماذا Cloudinary؟
على Render، نظام الملفات مؤقت (ephemeral)، مما يعني أن الملفات المرفوعة تُحذف عند إعادة تشغيل الخادم. لذلك نستخدم Cloudinary كحل تخزين سحابي دائم ومجاني.

## خطوات الإعداد

### 1. إنشاء حساب Cloudinary (مجاني)
1. اذهب إلى: https://cloudinary.com/users/register/free
2. سجّل حساب جديد (مجاني تماماً)
3. بعد التسجيل، ستصل إلى لوحة التحكم Dashboard

### 2. الحصول على بيانات API
من لوحة التحكم Dashboard، ستجد:
- **Cloud Name** (اسم السحابة)
- **API Key** (مفتاح API)
- **API Secret** (السر)

### 3. إضافة البيانات في Render

#### الطريقة الأولى: من لوحة تحكم Render
1. اذهب إلى https://dashboard.render.com
2. اختر خدمة `postmaker-ai-backend`
3. اذهب إلى تبويب **Environment**
4. أضف المتغيرات التالية:
   ```
   CLOUDINARY_CLOUD_NAME = your-cloud-name
   CLOUDINARY_API_KEY = your-api-key
   CLOUDINARY_API_SECRET = your-api-secret
   ```
5. احفظ التغييرات
6. سيتم إعادة تشغيل الخادم تلقائياً

#### الطريقة الثانية: تحديث render.yaml
يمكنك تحديث ملف `render.yaml` وإضافة القيم مباشرة (لكن هذا غير آمن لأن البيانات ستكون مرئية في GitHub):
```yaml
- key: CLOUDINARY_CLOUD_NAME
  value: your-actual-cloud-name
- key: CLOUDINARY_API_KEY
  value: your-actual-api-key
- key: CLOUDINARY_API_SECRET
  value: your-actual-api-secret
```

### 4. التحقق من عمل Cloudinary
بعد إضافة المتغيرات:
1. انتظر إعادة تشغيل الخادم (1-2 دقيقة)
2. اذهب إلى لوحة التحكم: https://postmaker-ai-frontend.onrender.com/admin/dashboard.html
3. أضف قالب جديد مع صورة
4. ستجد الصورة محفوظة في Cloudinary تحت مجلد `poster-templates`

## ملاحظات مهمة

### الحد المجاني في Cloudinary
- **تخزين**: 25 GB
- **عرض النطاق**: 25 GB شهرياً
- **تحويلات**: 25,000 تحويل شهرياً
- كافي جداً للاستخدام الشخصي والمشاريع الصغيرة!

### إذا لم تُعد Cloudinary
- سيعمل الموقع محلياً (localhost) بشكل طبيعي
- على Render، الصور ستُحذف عند إعادة تشغيل الخادم
- الحل: إما إعداد Cloudinary أو استخدام حل تخزين آخر

### بدائل Cloudinary
إذا أردت استخدام خدمة أخرى:
- **AWS S3**: خدمة Amazon
- **Imgur**: للصور فقط
- **ImageKit**: بديل مشابه لـ Cloudinary
- **Supabase Storage**: مع قاعدة بيانات مدمجة

## دعم فني
إذا واجهت مشاكل:
1. تأكد من نسخ المتغيرات بشكل صحيح (بدون مسافات زائدة)
2. تحقق من سجلات الخادم في Render للبحث عن أخطاء
3. تأكد من أن حسابك في Cloudinary مفعّل

---
✨ **تم إعداد النظام للعمل مع أو بدون Cloudinary!**
