// ====================
// Arabic Text Reshaper for Canvas/Fabric.js
// Converts Arabic characters to their connected presentation forms
// ====================

const ArabicReshaper = (function() {
    
    // Arabic character forms: [Isolated, Final, Initial, Medial]
    // Characters that connect to both sides have all 4 forms
    // Characters that only connect to the right have Isolated and Final forms
    const CHAR_MAP = {
        // Hamza
        '\u0621': ['\uFE80', '\uFE80', '\uFE80', '\uFE80'], // ء
        // Alef with Madda
        '\u0622': ['\uFE81', '\uFE82', '\uFE81', '\uFE82'], // آ
        // Alef with Hamza above
        '\u0623': ['\uFE83', '\uFE84', '\uFE83', '\uFE84'], // أ
        // Waw with Hamza
        '\u0624': ['\uFE85', '\uFE86', '\uFE85', '\uFE86'], // ؤ
        // Alef with Hamza below
        '\u0625': ['\uFE87', '\uFE88', '\uFE87', '\uFE88'], // إ
        // Yeh with Hamza
        '\u0626': ['\uFE89', '\uFE8A', '\uFE8B', '\uFE8C'], // ئ
        // Alef
        '\u0627': ['\uFE8D', '\uFE8E', '\uFE8D', '\uFE8E'], // ا
        // Beh
        '\u0628': ['\uFE8F', '\uFE90', '\uFE91', '\uFE92'], // ب
        // Teh Marbuta
        '\u0629': ['\uFE93', '\uFE94', '\uFE93', '\uFE94'], // ة
        // Teh
        '\u062A': ['\uFE95', '\uFE96', '\uFE97', '\uFE98'], // ت
        // Theh
        '\u062B': ['\uFE99', '\uFE9A', '\uFE9B', '\uFE9C'], // ث
        // Jeem
        '\u062C': ['\uFE9D', '\uFE9E', '\uFE9F', '\uFEA0'], // ج
        // Hah
        '\u062D': ['\uFEA1', '\uFEA2', '\uFEA3', '\uFEA4'], // ح
        // Khah
        '\u062E': ['\uFEA5', '\uFEA6', '\uFEA7', '\uFEA8'], // خ
        // Dal
        '\u062F': ['\uFEA9', '\uFEAA', '\uFEA9', '\uFEAA'], // د
        // Thal
        '\u0630': ['\uFEAB', '\uFEAC', '\uFEAB', '\uFEAC'], // ذ
        // Reh
        '\u0631': ['\uFEAD', '\uFEAE', '\uFEAD', '\uFEAE'], // ر
        // Zain
        '\u0632': ['\uFEAF', '\uFEB0', '\uFEAF', '\uFEB0'], // ز
        // Seen
        '\u0633': ['\uFEB1', '\uFEB2', '\uFEB3', '\uFEB4'], // س
        // Sheen
        '\u0634': ['\uFEB5', '\uFEB6', '\uFEB7', '\uFEB8'], // ش
        // Sad
        '\u0635': ['\uFEB9', '\uFEBA', '\uFEBB', '\uFEBC'], // ص
        // Dad
        '\u0636': ['\uFEBD', '\uFEBE', '\uFEBF', '\uFEC0'], // ض
        // Tah
        '\u0637': ['\uFEC1', '\uFEC2', '\uFEC3', '\uFEC4'], // ط
        // Zah
        '\u0638': ['\uFEC5', '\uFEC6', '\uFEC7', '\uFEC8'], // ظ
        // Ain
        '\u0639': ['\uFEC9', '\uFECA', '\uFECB', '\uFECC'], // ع
        // Ghain
        '\u063A': ['\uFECD', '\uFECE', '\uFECF', '\uFED0'], // غ
        // Feh
        '\u0641': ['\uFED1', '\uFED2', '\uFED3', '\uFED4'], // ف
        // Qaf
        '\u0642': ['\uFED5', '\uFED6', '\uFED7', '\uFED8'], // ق
        // Kaf
        '\u0643': ['\uFED9', '\uFEDA', '\uFEDB', '\uFEDC'], // ك
        // Lam
        '\u0644': ['\uFEDD', '\uFEDE', '\uFEDF', '\uFEE0'], // ل
        // Meem
        '\u0645': ['\uFEE1', '\uFEE2', '\uFEE3', '\uFEE4'], // م
        // Noon
        '\u0646': ['\uFEE5', '\uFEE6', '\uFEE7', '\uFEE8'], // ن
        // Heh
        '\u0647': ['\uFEE9', '\uFEEA', '\uFEEB', '\uFEEC'], // ه
        // Waw
        '\u0648': ['\uFEED', '\uFEEE', '\uFEED', '\uFEEE'], // و
        // Alef Maksura
        '\u0649': ['\uFEEF', '\uFEF0', '\uFEEF', '\uFEF0'], // ى
        // Yeh
        '\u064A': ['\uFEF1', '\uFEF2', '\uFEF3', '\uFEF4'], // ي
        // Tatweel (kashida)
        '\u0640': ['\u0640', '\u0640', '\u0640', '\u0640'], // ـ
    };

    // Characters that don't connect to the next (left) character
    // These only have Isolated and Final forms
    const NON_JOINING_LEFT = new Set([
        '\u0621', // ء Hamza
        '\u0622', // آ
        '\u0623', // أ
        '\u0624', // ؤ
        '\u0625', // إ
        '\u0627', // ا Alef
        '\u062F', // د Dal
        '\u0630', // ذ Thal
        '\u0631', // ر Reh
        '\u0632', // ز Zain
        '\u0648', // و Waw
        '\u0629', // ة Teh Marbuta
        '\u0649', // ى Alef Maksura
    ]);

    // Lam-Alef ligatures
    const LAM_ALEF = {
        '\u0622': '\uFEF5',  // لآ - Lam + Alef with Madda (isolated)
        '\u0622f': '\uFEF6', // لآ - Lam + Alef with Madda (final)
        '\u0623': '\uFEF7',  // لأ - Lam + Alef with Hamza above (isolated)
        '\u0623f': '\uFEF8', // لأ - Lam + Alef with Hamza above (final)
        '\u0625': '\uFEF9',  // لإ - Lam + Alef with Hamza below (isolated)
        '\u0625f': '\uFEFA', // لإ - Lam + Alef with Hamza below (final)
        '\u0627': '\uFEFB',  // لا - Lam + Alef (isolated)
        '\u0627f': '\uFEFC', // لا - Lam + Alef (final)
    };

    // Check if character is Arabic
    function isArabicChar(ch) {
        if (!ch) return false;
        const code = ch.charCodeAt(0);
        return (code >= 0x0600 && code <= 0x06FF) || 
               (code >= 0x0750 && code <= 0x077F) ||
               (code >= 0x08A0 && code <= 0x08FF) ||
               (code >= 0xFB50 && code <= 0xFDFF) ||
               (code >= 0xFE70 && code <= 0xFEFF) ||
               ch === '\u0640'; // Tatweel
    }

    // Check if character is a diacritic (tashkeel)
    function isDiacritic(ch) {
        if (!ch) return false;
        const code = ch.charCodeAt(0);
        return (code >= 0x064B && code <= 0x065F) || // Fathah, Dammah, Kasrah, etc.
               (code >= 0x0610 && code <= 0x061A) || // Other marks
               code === 0x0670; // Superscript Alef
    }

    // Get the actual next significant character (skip diacritics)
    function getNextChar(text, index) {
        for (let i = index + 1; i < text.length; i++) {
            if (!isDiacritic(text[i])) return text[i];
        }
        return null;
    }

    // Get the actual previous significant character (skip diacritics)
    function getPrevChar(text, index) {
        for (let i = index - 1; i >= 0; i--) {
            if (!isDiacritic(text[i])) return text[i];
        }
        return null;
    }

    /**
     * Reshape Arabic text - convert to presentation forms
     * This makes Arabic letters connect properly in Canvas/Fabric.js
     */
    function reshape(text) {
        if (!text) return text;
        
        // Check if text has Arabic
        const hasArabic = /[\u0600-\u06FF]/.test(text);
        if (!hasArabic) return text;

        let result = '';
        
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            
            // Skip diacritics (keep them as-is after the base letter)
            if (isDiacritic(ch)) {
                result += ch;
                continue;
            }
            
            // Non-Arabic character - pass through
            if (!CHAR_MAP[ch]) {
                result += ch;
                continue;
            }

            const prevChar = getPrevChar(text, i);
            const nextChar = getNextChar(text, i);
            
            const prevIsArabic = prevChar && CHAR_MAP[prevChar] && !NON_JOINING_LEFT.has(prevChar);
            const nextIsArabic = nextChar && CHAR_MAP[nextChar];

            // Handle Lam-Alef ligatures
            if (ch === '\u0644' && nextChar && LAM_ALEF[nextChar] !== undefined) {
                const lamConnectedFromRight = prevIsArabic;
                const ligature = lamConnectedFromRight ? LAM_ALEF[nextChar + 'f'] : LAM_ALEF[nextChar];
                if (ligature) {
                    result += ligature;
                    // Skip the Alef (and any diacritics between Lam and Alef)
                    let skip = i + 1;
                    while (skip < text.length && isDiacritic(text[skip])) skip++;
                    i = skip; // Will be incremented by for loop
                    continue;
                }
            }

            // Determine form: 0=isolated, 1=final, 2=initial, 3=medial
            let form = 0; // isolated by default
            
            const canConnectRight = prevIsArabic; // Previous char connects to this
            const canConnectLeft = nextIsArabic && !NON_JOINING_LEFT.has(ch); // This connects to next

            if (canConnectRight && canConnectLeft) {
                form = 3; // medial
            } else if (canConnectRight) {
                form = 1; // final
            } else if (canConnectLeft) {
                form = 2; // initial
            } else {
                form = 0; // isolated
            }

            result += CHAR_MAP[ch][form];
        }

        return result;
    }

    /**
     * Reverse the order of Arabic words for RTL display in LTR Canvas
     * Keeps word order right for RTL and handles mixed content
     */
    function reverseArabicText(text) {
        if (!text) return text;
        
        // Split into words
        const words = text.split(' ');
        
        // Check if primarily Arabic
        const arabicCount = words.filter(w => /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(w)).length;
        
        if (arabicCount > words.length / 2) {
            // Reverse word order for RTL
            return words.reverse().join(' ');
        }
        
        return text;
    }

    /**
     * Full Arabic text processing: reshape + reverse for Canvas
     */
    function processArabic(text) {
        if (!text) return text;
        
        // First reshape (connect letters)
        let processed = reshape(text);
        
        // Then reverse for RTL display in Canvas
        processed = reverseArabicText(processed);
        
        return processed;
    }

    return {
        reshape: reshape,
        reverse: reverseArabicText,
        process: processArabic
    };
})();

// Export for use
if (typeof window !== 'undefined') {
    window.ArabicReshaper = ArabicReshaper;
}
