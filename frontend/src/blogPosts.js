const PUBLISHED = "2026-11-15";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatBlogDate(iso) {
  const [year, month, day] = String(iso || "").split("-").map(Number);
  if (!year || !month || !day) return "";
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function t(text) {
  return { text };
}

function a(text, href) {
  return { text, href };
}

export const BLOG_LISTING = {
  seoTitle: "Mizazy Blog | Earbud, Neckband and Charger Guides",
  metaDescription:
    "Read Mizazy guides on wireless earbuds, Bluetooth neckbands and fast mobile chargers, based on the details published for current products.",
  h1: "Mizazy Blog – Guides, Tips and Buying Advice",
  introduction:
    "Short buying guides for the products Mizazy sells today: wireless earbuds, a Bluetooth neckband, and fast mobile chargers. The notes below stay with the details published on the product pages.",
};

export const ARTICLES = [
  {
    slug: "how-to-choose-wireless-earbuds",
    title: "How to Choose Wireless Earbuds",
    seoTitle: "How to Choose Wireless Earbuds: Buying Guide | Mizazy",
    metaDescription:
      "Learn how to choose wireless earbuds for music and calls. Compare Bluetooth, battery, microphones and ENC, including the published Buds 104 details.",
    excerpt:
      "A practical way to compare wireless earbuds: Bluetooth, battery wording, call microphones, ENC, fit, and the devices you already use.",
    h1: "How to Choose Wireless Earbuds: A Complete Buying Guide",
    primaryKeyword: "Wireless earbuds",
    secondaryKeywords: [
      "TWS earbuds",
      "Bluetooth earbuds",
      "Wireless earbuds with microphone",
      "Wireless earbuds for music and calls",
    ],
    category: "Earbuds",
    author: "MIZAZY",
    datePublished: PUBLISHED,
    featuredImage: "https://res.cloudinary.com/aiwtovua/image/upload/v1790761956/Mizazy_Earbuds_104_Black_Front.png",
    featuredImageAlt: "Mizazy Buds 104 wireless earbuds with the charging case",
    introduction: [
      [
        t("Wireless earbuds connect to a phone, tablet, or laptop over Bluetooth. There is no cable running to your ears. Most models sold now are true wireless earbuds, often called "),
        t("TWS earbuds"),
        t(". Each bud has its own battery, and a case tops them up between listens."),
      ],
      [
        t("People use them for music and for calls, so a microphone is part of the decision, not an extra. A useful comparison looks at the Bluetooth version, how the battery figure is worded, call microphones, whether environmental noise cancellation is listed, fit, and the devices you already own."),
      ],
    ],
    sections: [
      {
        id: "bluetooth",
        heading: "Bluetooth version and connectivity",
        paragraphs: [
          [
            t("Bluetooth is the radio between the earbuds and the phone. A listed version such as Bluetooth 5.0 tells you the generation of that radio. It does not, by itself, promise a certain distance across every room. Walls, a pocket, and other wireless devices can still interrupt playback."),
          ],
          [
            t("When you compare Bluetooth earbuds, read the version on the product page rather than assuming a newer-looking design has a newer radio. "),
            a("Mizazy Wireless Buds 104", "/product/mizazy-wireless-buds-104"),
            t(" list Bluetooth 5.0. That is the connectivity detail to put beside battery and microphones, not a claim about how far you can walk from your phone."),
          ],
        ],
      },
      {
        id: "battery",
        heading: "Battery life and the charging case",
        paragraphs: [
          [
            t("Earbud batteries are small. The large hour number on a listing often includes the charging case, not one uninterrupted session in your ears. Louder volume and long calls usually shorten the time you get from a single charge of the buds."),
          ],
          [
            t("Buds 104 list about 35 hours of backup with the charging case, together with Bluetooth 5.0, a quad microphone, environmental noise cancellation, and HD sound. Read that 35-hour figure as time that includes recharging the buds from the case. Check the box contents on the product page before you assume a charging cable is packed with the case."),
          ],
        ],
      },
      {
        id: "microphone",
        heading: "Microphone quality for calls",
        paragraphs: [
          [
            t("Wireless earbuds for music and calls need a microphone you can find in the description. A quiet room is forgiving. A street, a fan, or a busy office is not. More than one microphone gives the earbuds more than one pickup, which can help the phone sort your voice from the room."),
          ],
          [
            t("Buds 104 list a quad mic. That is a reason to consider them if calls matter. It is not a promise that every caller will hear a silent background. If you mostly listen and rarely talk, the microphone still matters for the occasional call, but it does not need to be the first line you compare."),
          ],
        ],
      },
      {
        id: "enc",
        heading: "What environmental noise cancellation does",
        paragraphs: [
          [
            t("Environmental noise cancellation, often written as ENC, is aimed at the call. It is meant to reduce some of the background noise that would otherwise be sent to the person you are speaking with."),
          ],
          [
            t("ENC is not the same thing as active noise cancellation. Active noise cancellation is a different feature, aimed at what you hear in your own ears. Do not read an ENC line as proof that traffic or an office will go quiet for you. Buds 104 list ENC with the quad mic. Treat that pair as a calling feature, and judge listening isolation by the fit and by any separate listening claim the product actually makes."),
          ],
        ],
      },
      {
        id: "sound",
        heading: "Sound quality and how you listen",
        paragraphs: [
          [
            t("HD sound is a description of the tuning the product lists. It is not a lab score you can line up against another brand without listening. Podcasts and calls reward clear voices. Music rewards a balance you can wear for a long time without turning the volume up to hear detail."),
          ],
          [
            t("Buds 104 list HD sound. Use that as the published sound note, then decide whether you want earbuds mainly for calls, mainly for music, or for both. The "),
            a("Mizazy wireless earbuds", "/category/earbuds"),
            t(" category is the place to see Buds 104 next to the other TWS model and compare those published notes side by side."),
          ],
        ],
      },
      {
        id: "fit",
        heading: "Comfort and fit",
        paragraphs: [
          [
            t("Fit changes both comfort and the bass you hear. Tips that are too large ache. Tips that are too small fall out when you walk or talk. A seal that feels fine for a song can feel tiring after an hour."),
          ],
          [
            t("The published Buds 104 details do not add a sport-lock or sweat claim. Choose them for everyday music and calls unless you have checked fit for yourself. If a pair hurts, or will not stay seated, no Bluetooth version fixes that."),
          ],
        ],
      },
      {
        id: "compatibility",
        heading: "Compatibility with your devices",
        paragraphs: [
          [
            t("Bluetooth earbuds pair from the phone, tablet, or laptop Bluetooth menu. They do not need the same plug as an old wired headset. A recent phone is usually enough. The case still needs power, so the cable and adapter you already own matter only for charging the case, not for the audio connection."),
          ],
          [
            t("Before you buy, confirm the listing says Bluetooth, then confirm you are comfortable pairing a device. If you share one phone with wired accessories, the earbuds simply become another Bluetooth device in that list. They do not replace a charger or a data cable."),
          ],
        ],
      },
      {
        id: "compare",
        heading: "What to compare before you buy",
        paragraphs: [
          [
            t("Put the same questions beside each model. What Bluetooth version is listed? Does the battery figure include the case? Is a microphone described, and is it a single mic or a quad mic? Is ENC listed, and do you understand it is for calls? What sound description is actually printed? Will you wear them long enough that fit matters more than the badge on the box?"),
          ],
          [
            t("Skip any listing that turns ENC into a promise of silence for the wearer. Skip hour counts that never say whether the case is included in the number. Those two checks remove a lot of disappointment."),
          ],
        ],
      },
      {
        id: "checklist",
        heading: "Buying checklist",
        paragraphs: [
          [
            t("Use this list when you are ready to choose. It is a reminder of what the product page should tell you, including the Buds 104 page if that is the pair you are considering."),
          ],
        ],
        list: [
          "They are wireless earbuds with a Bluetooth version you can read.",
          "The battery figure says whether the charging case is included in the hours.",
          "A microphone is listed if you want wireless earbuds for music and calls.",
          "ENC, if listed, is treated as call noise handling, not active noise cancellation.",
          "The sound note matches how you listen, and the fit is something you can live with.",
          "Box contents and pairing are clear before you pay.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do TWS earbuds have a wire between the two buds?",
        answer: "No. True wireless earbuds connect without a cable between the buds. A charging case stores them and recharges them.",
      },
      {
        question: "Is ENC the same as active noise cancellation?",
        answer: "No. Environmental noise cancellation is aimed at background noise on a call. It is not the same feature as active noise cancellation for the person wearing the earbuds.",
      },
      {
        question: "Does the Buds 104 35-hour figure mean 35 hours from one charge?",
        answer: "The Buds 104 listing describes about 35 hours of backup with the charging case. It is not a claim of 35 hours from the buds alone.",
      },
    ],
    relatedProducts: [
      { href: "/product/mizazy-wireless-buds-104", label: "Mizazy Wireless Buds 104" },
    ],
    relatedCategories: [
      { href: "/category/earbuds", label: "Mizazy wireless earbuds" },
    ],
    relatedArticles: ["tws-earbuds-vs-bluetooth-neckband"],
  },
  {
    slug: "tws-earbuds-vs-bluetooth-neckband",
    title: "TWS Earbuds vs Bluetooth Neckband",
    seoTitle: "TWS Earbuds vs Bluetooth Neckband: Which to Choose?",
    metaDescription:
      "Compare TWS earbuds and a Bluetooth neckband for fit, battery and calls. See how Mizazy Buds 104 and the Equalizer neckband are listed.",
    excerpt:
      "TWS earbuds leave you without a band. A neckband stays around your neck. Here is how to choose without crowning a winner.",
    h1: "TWS Earbuds vs Bluetooth Neckband: Key Differences",
    primaryKeyword: "TWS earbuds vs neckband",
    secondaryKeywords: [
      "Wireless earbuds",
      "Bluetooth neckband",
      "Neckband earphones",
      "Wireless neckband",
    ],
    category: "Comparison",
    author: "MIZAZY",
    datePublished: PUBLISHED,
    featuredImage: "https://res.cloudinary.com/aiwtovua/image/upload/v1790765790/Mizazy_Equalizer_Bluetooth_Neckband_Black1.png",
    featuredImageAlt: "Mizazy Equalizer Bluetooth neckband earphones",
    introduction: [
      [
        t("TWS earbuds vs neckband is a design choice before it is a sound choice. True wireless earbuds are two separate buds and a case. A Bluetooth neckband is a band you wear around your neck, with earphones attached. Neither style is automatically the better one."),
      ],
      [
        t("This comparison uses two published Mizazy products: "),
        a("Mizazy Wireless Buds 104", "/product/mizazy-wireless-buds-104"),
        t(" and the "),
        a("Mizazy Equalizer Bluetooth Neckband", "/product/mizazy-equalizer-bluetooth-neckband"),
        t(". The hour figures are not interchangeable, because one listing includes a charging case and the other lists playtime for the neckband itself."),
      ],
    ],
    sections: [
      {
        id: "tws",
        heading: "What TWS earbuds are",
        paragraphs: [
          [
            t("TWS means true wireless. There is no cable between the left and right bud. You take them from a case, pair them once, and put them back in the case to charge. They are the usual meaning of wireless earbuds in a current shop."),
          ],
          [
            t("Buds 104 are TWS earbuds listed with about 35 hours of backup with the charging case, Bluetooth 5.0, a quad mic, environmental noise cancellation, and HD sound. Those are calling and music details for a bud-and-case design. See the "),
            a("earbuds category", "/category/earbuds"),
            t(" if you want the pair beside the other TWS model."),
          ],
        ],
      },
      {
        id: "neckband",
        heading: "What a Bluetooth neckband is",
        paragraphs: [
          [
            t("A Bluetooth neckband, sometimes called neckband earphones or a wireless neckband, rests on your neck. The earphones lift to your ears and drop back to the band when you pause. You are less likely to put a single bud down and lose it, and you are wearing the band even when the earphones are out."),
          ],
          [
            t("The Equalizer listing includes up to 100 hours of playtime, 13mm drivers, and Bluetooth 5.2. The product title also includes magnetic earbuds, so the earphones can attach to the band when you are not listening. The "),
            a("neckband category", "/category/neckband"),
            t(" is where that model is shown."),
          ],
        ],
      },
      {
        id: "design",
        heading: "Design and portability",
        paragraphs: [
          [
            t("Earbuds disappear into a pocket because the case is the whole package. A neckband is longer and stays in place around your neck, which some people prefer on a commute and others find in the way of a collar or a bag strap."),
          ],
          [
            t("Choose the shape you will actually carry. A case you forget at home leaves the buds uncharged later. A band you dislike wearing will stay in a drawer no matter what the battery listing says."),
          ],
        ],
      },
      {
        id: "comfort",
        heading: "Comfort and everyday use",
        paragraphs: [
          [
            t("Earbuds put all of their weight in the ear. Comfort depends on the tip and the shell. A neckband moves some of the weight to the neck and can feel easier if in-ear pressure bothers you, but the band is something you notice in warm weather and with some clothes."),
          ],
          [
            t("Neither Mizazy listing claims a universal fit. If you already know that buds fall out, a neckband is a reasonable design to try. If you want nothing on your neck, stay with TWS earbuds and spend the decision on tips and seal."),
          ],
        ],
      },
      {
        id: "battery",
        heading: "Battery and charging",
        paragraphs: [
          [
            t("Do not treat 35 hours and 100 hours as the same kind of number. Buds 104 list about 35 hours of backup with the charging case. The Equalizer lists up to 100 hours of playtime. One figure depends on putting the buds back in a case. The other is the playtime listed for the neckband. Volume and calls change both."),
          ],
          [
            t("Charging is different too. Earbuds charge from their case, and the case itself needs power. The Equalizer product title includes Type-C charging for the neckband. Read the box contents on each page so you know whether you must supply a cable."),
          ],
        ],
      },
      {
        id: "calls",
        heading: "Calls and microphones",
        paragraphs: [
          [
            t("Buds 104 list a quad mic and environmental noise cancellation. ENC here means help with background noise on a call. It is not active noise cancellation for the listener, and it is not a reason to say the earbuds are better for every conversation."),
          ],
          [
            t("The Equalizer page leads with playtime, 13mm drivers, and Bluetooth 5.2, not with a quad-mic or ENC line. If calls are the main job, read the microphone wording on the product you are buying. If the page does not describe a microphone in the same way, do not invent one from the other product."),
          ],
        ],
      },
      {
        id: "music",
        heading: "Music and general use",
        paragraphs: [
          [
            t("Buds 104 list HD sound. The Equalizer lists 13mm drivers. Those are different ways of describing playback. Driver size is not a score, and HD sound is not a measurement you can subtract from 13mm. Listen for whether voices and music stay comfortable at the volume you actually use."),
          ],
          [
            t("For a desk or a quiet room, either design can be enough. For walking with a collar, a bag, and one hand free, try the shape first. The radio versions differ too: Bluetooth 5.0 on Buds 104 and Bluetooth 5.2 on the Equalizer. That is a spec difference, not a winner."),
          ],
        ],
      },
      {
        id: "who",
        heading: "Which type suits which habits",
        paragraphs: [
          [
            t("TWS earbuds suit someone who wants a small case, nothing around the neck, and a listed call microphone. The Buds 104 details match that brief: a case, Bluetooth 5.0, a quad mic, ENC for calls, and HD sound."),
          ],
          [
            t("A Bluetooth neckband suits someone who wants the earphones to stay with a band, who likes magnetic earbuds that park on the neck, and who is comparing the listed 100-hour playtime and 13mm drivers. It is a poor match if you dislike wearing a band, just as earbuds are a poor match if they will not stay in your ears."),
          ],
        ],
      },
      {
        id: "checklist",
        heading: "Buying checklist and conclusion",
        paragraphs: [
          [
            t("There is no universal winner between these two. Pick the shape you will wear, then check the published battery wording, the Bluetooth version, and whether a microphone is actually described."),
          ],
        ],
        list: [
          "Choose TWS earbuds if you want a case and no band.",
          "Choose a neckband if you want the earphones to hang from your neck.",
          "Read 35 hours with the Buds 104 case separately from up to 100 hours on the Equalizer.",
          "Use the quad mic and ENC notes only for the product that lists them.",
          "Compare Bluetooth 5.0 and Bluetooth 5.2 as listed versions, not as a verdict.",
          "Open both product pages before you decide.",
        ],
      },
    ],
    faqs: [
      {
        question: "Are TWS earbuds and a neckband the same product with a different cable?",
        answer: "No. TWS earbuds are separate buds with a charging case. A Bluetooth neckband is a band you wear, with earphones attached to it.",
      },
      {
        question: "Is the Equalizer battery figure the same kind of number as Buds 104?",
        answer: "No. Buds 104 list about 35 hours of backup with the charging case. The Equalizer lists up to 100 hours of playtime for the neckband. They should not be compared as identical measurements.",
      },
      {
        question: "Which Mizazy model is better for everyone?",
        answer: "Neither. Buds 104 fit a case-and-earbuds habit, with a listed quad mic and ENC. The Equalizer fits a neckband habit, with listed 13mm drivers, Bluetooth 5.2, and up to 100 hours of playtime.",
      },
    ],
    relatedProducts: [
      { href: "/product/mizazy-wireless-buds-104", label: "Mizazy Wireless Buds 104" },
      { href: "/product/mizazy-equalizer-bluetooth-neckband", label: "Mizazy Equalizer Bluetooth Neckband" },
    ],
    relatedCategories: [
      { href: "/category/earbuds", label: "Mizazy wireless earbuds" },
      { href: "/category/neckband", label: "Mizazy Bluetooth neckbands" },
    ],
    relatedArticles: ["how-to-choose-wireless-earbuds"],
  },
  {
    slug: "how-to-choose-fast-mobile-charger",
    title: "How to Choose a Fast Mobile Charger",
    seoTitle: "How to Choose a Fast Mobile Charger | Mizazy Guide",
    metaDescription:
      "Learn how to choose a fast mobile charger, from USB-C and USB-A ports to wattage. See what the Mizazy 20W and 135W chargers include.",
    excerpt:
      "Wattage, port type, and the cable in the box matter more than a large number. Actual speed still depends on the phone.",
    h1: "How to Choose a Fast Mobile Charger: Complete Guide",
    primaryKeyword: "Fast mobile charger",
    secondaryKeywords: [
      "USB-C charger",
      "Mobile charger",
      "USB fast charger",
      "USB-C and USB-A charger",
    ],
    category: "Chargers",
    author: "MIZAZY",
    datePublished: PUBLISHED,
    featuredImage: "https://res.cloudinary.com/aiwtovua/image/upload/v1790766592/Mizazy_135W_Super_Fast_Charger_Front.png",
    featuredImageAlt: "Mizazy 135W fast mobile charger with USB-C and USB-A ports",
    introduction: [
      [
        t("A fast mobile charger is a power adapter that can offer more power than a basic phone charger, through USB-C, USB-A, or both. The watt number on the box is the maximum the charger is built to offer. It is not the speed your phone is guaranteed to accept."),
      ],
      [
        t("Actual charging speed depends on the phone, the charging protocol it supports, the cable, and whether that cable and charger work together. A 135W listing does not mean every phone will charge at 135W."),
      ],
    ],
    sections: [
      {
        id: "meaning",
        heading: "What fast charging means",
        paragraphs: [
          [
            t("Fast charging means the charger and the phone negotiate a higher-power mode than a slow 5-watt trickle, when both sides support it. If the phone only accepts a modest rate, a larger adapter cannot force a higher one. If the cable cannot carry the mode the phone expects, the charge falls back."),
          ],
          [
            t("Read fast as a capability of the adapter, then check the phone manual or the phone settings for what that handset supports. The charger page cannot know your handset."),
          ],
        ],
      },
      {
        id: "ports",
        heading: "USB-A and USB-C ports",
        paragraphs: [
          [
            t("USB-C is the oval port on most current phones and on many chargers. USB-A is the older rectangular port. A USB-C charger with only that port is the simple match for a USB-C phone, provided you have a USB-C cable. A USB-C and USB-A charger gives you one of each, which is useful when two devices, or an older cable, need different plugs."),
          ],
          [
            t("The "),
            a("Mizazy 135W Super Fast Charger", "/product/mizazy-135w-super-fast-charger"),
            t(" lists USB-C and USB-A ports and an intelligent chip. The "),
            a("Mizazy 20W USB-C Power Adapter", "/product/mizazy-20w-usb-c-fast-charger-for-iphone"),
            t(" lists a single USB-C output and is described as iPhone compatible. Both are mobile chargers. They are not the same tool."),
          ],
        ],
      },
      {
        id: "wattage",
        heading: "How to read wattage",
        paragraphs: [
          [
            t("Wattage is the maximum output the charger listing states. 20W and 135W Max are different ceilings. A higher ceiling can be useful for a device that is allowed to draw more power. It does not raise the ceiling of a phone that stops at a lower rate."),
          ],
          [
            t("Use 20W when you want a compact USB-C adapter in the range many phones are designed around, and you have read that your phone can use a USB-C charger. Use the 135W listing when you want the higher maximum, both port types, and the intelligent chip the page describes. Do not buy 135W because you expect every handset to take 135W."),
          ],
        ],
      },
      {
        id: "compatibility",
        heading: "Device compatibility and charging limits",
        paragraphs: [
          [
            t("The phone decides how much power it will take. The protocol it supports, its battery condition, and its temperature all sit between the adapter and the result you see on screen. Two phones on the same charger can show different times."),
          ],
          [
            t("The 20W adapter is the iPhone-compatible USB-C model in this range. The 135W charger is the USB fast charger with USB-C and USB-A. Compatibility still means a supported device and a suitable cable, not a promise for every phone, tablet, or laptop."),
          ],
        ],
      },
      {
        id: "cables",
        heading: "Cable compatibility",
        paragraphs: [
          [
            t("The port on the charger has to match the cable, and the other end of the cable has to match the phone. A USB-C charger without a cable in the box still needs a cable you already trust. A charger that includes a cable saves that step only for the connector that cable uses."),
          ],
          [
            t("The 135W box includes a 1m charging cable. The 20W adapter does not include a cable. If you buy the 20W adapter, plan on a separate USB-C cable that suits the phone. If you buy the 135W charger, the included 1m cable is part of the published box contents, and the second port is still there for another cable you supply."),
          ],
        ],
      },
      {
        id: "safety",
        heading: "Safety and build",
        paragraphs: [
          [
            t("A charger should list basic protections and a recognisable seller, and it should not get forgotten under a cushion while covered. The 135W page describes an intelligent chip that detects the connected device and sets current for a compatible device. That is a control feature, not a statement that every device will fast-charge."),
          ],
          [
            t("Use the cable in good condition. A loose connector that heats up is a reason to stop, not a reason to press the plug harder. Unplug a charger you do not need to leave running overnight if the phone is already full."),
          ],
        ],
      },
      {
        id: "choose",
        heading: "How to choose the right charger",
        paragraphs: [
          [
            t("Start with the phone port. If it is USB-C and you want a small iPhone-compatible adapter, the 20W USB-C model matches that brief, with the cable bought separately. If you want USB-C and USB-A on one adapter, plus the higher listed maximum and a cable in the box, the 135W model matches that brief."),
          ],
          [
            t("Then check the phone. If the handset documentation stops well below 135W, the extra maximum is unused headroom, not a faster charge. The "),
            a("charger category", "/category/android-and-iphone-charger"),
            t(" shows both adapters together so the port count and the included cable are easy to compare."),
          ],
        ],
      },
      {
        id: "mistakes",
        heading: "Common fast-charging mistakes",
        paragraphs: [
          [
            t("The usual mistakes are simple. Buying the highest watt number and assuming the phone will take all of it. Forgetting that the 20W box has no cable. Using a worn cable and blaming the adapter. Covering a warm charger. Comparing two chargers by the printed maximum while ignoring USB-C versus USB-A."),
          ],
          [
            t("Another mistake is treating an intelligent chip as a bypass of the phone limit. The chip is there to recognise a compatible device and supply an appropriate current. The phone still has the last word."),
          ],
        ],
      },
      {
        id: "checklist",
        heading: "Buying checklist",
        paragraphs: [
          [
            t("Check these points on the product page, then check them against the phone you actually own."),
          ],
        ],
        list: [
          "The phone port is USB-C, USB-A, or you have a cable that bridges them safely.",
          "You know whether you need one port or both USB-C and USB-A.",
          "You have read the wattage as a maximum, not as a guaranteed phone speed.",
          "The 20W adapter is USB-C, iPhone compatible as listed, and does not include a cable.",
          "The 135W charger lists 135W Max, USB-C and USB-A, an intelligent chip, and a 1m cable in the box.",
          "You accept that charging speed depends on the device, protocol, cable, and charger together.",
        ],
      },
    ],
    faqs: [
      {
        question: "Will the 135W charger charge every phone at 135W?",
        answer: "No. 135W Max is the charger maximum. The phone, its charging protocol, the cable, and compatibility decide the actual speed. Many phones take less than that maximum.",
      },
      {
        question: "Does the 20W USB-C adapter include a cable?",
        answer: "No. The 20W box contains the adapter and packaging. You need a separate compatible cable. The 135W box includes a 1m charging cable.",
      },
      {
        question: "What is the difference between the two Mizazy chargers?",
        answer: "The 20W model is a compact USB-C adapter listed as iPhone compatible, without a cable. The 135W model lists USB-C and USB-A ports, an intelligent chip, a higher maximum, and a 1m cable in the box.",
      },
    ],
    relatedProducts: [
      { href: "/product/mizazy-135w-super-fast-charger", label: "Mizazy 135W Super Fast Charger" },
      { href: "/product/mizazy-20w-usb-c-fast-charger-for-iphone", label: "Mizazy 20W USB-C Power Adapter" },
    ],
    relatedCategories: [
      { href: "/category/android-and-iphone-charger", label: "Mizazy fast mobile chargers" },
    ],
    relatedArticles: [],
  },
];

const PRODUCT_GUIDES = {
  "mizazy-wireless-buds-104": "how-to-choose-wireless-earbuds",
  "mizazy-equalizer-bluetooth-neckband": "tws-earbuds-vs-bluetooth-neckband",
  "mizazy-135w-super-fast-charger": "how-to-choose-fast-mobile-charger",
  "mizazy-20w-usb-c-fast-charger-for-iphone": "how-to-choose-fast-mobile-charger",
};

const CATEGORY_GUIDES = {
  earbuds: "how-to-choose-wireless-earbuds",
  neckband: "tws-earbuds-vs-bluetooth-neckband",
  "android-and-iphone-charger": "how-to-choose-fast-mobile-charger",
};

export function getArticle(slug) {
  return ARTICLES.find((article) => article.slug === slug) || null;
}

export function guideForProduct(slug) {
  return getArticle(PRODUCT_GUIDES[slug] || "");
}

export function guideForCategory(slug) {
  return getArticle(CATEGORY_GUIDES[slug] || "");
}

export function matchBlogPath(pathname) {
  const path = decodeURIComponent(String(pathname || "/")).replace(/\/+$/, "") || "/";
  if (path === "/blog") return { kind: "listing", statusCode: 200 };
  if (!path.startsWith("/blog/")) return null;
  const match = path.match(/^\/blog\/([^/]+)$/);
  if (!match) return { kind: "missing", statusCode: 404, slug: "" };
  const article = getArticle(match[1]);
  if (!article) return { kind: "missing", statusCode: 404, slug: match[1] };
  return { kind: "article", statusCode: 200, article };
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(parts) {
  return (parts || []).map((part) => (
    part.href
      ? `<a href="${esc(part.href)}">${esc(part.text)}</a>`
      : esc(part.text)
  )).join("");
}

function paragraphHtml(blocks) {
  return (blocks || []).map((parts) => `<p>${inline(parts)}</p>`).join("");
}

function relatedHtml(article) {
  const articles = article.relatedArticles
    .map((slug) => getArticle(slug))
    .filter(Boolean);
  const groups = [
    ["Related guides", articles.map((item) => ({ href: `/blog/${item.slug}`, label: item.title }))],
    ["Products", article.relatedProducts],
    ["Categories", article.relatedCategories],
  ].filter(([, items]) => items.length);
  if (!groups.length) return "";
  return `<aside>${groups.map(([heading, items]) => (
    `<section><h2>${esc(heading)}</h2><ul>${items.map((item) => `<li><a href="${esc(item.href)}">${esc(item.label)}</a></li>`).join("")}</ul></section>`
  )).join("")}</aside>`;
}

function articleHtml(article) {
  const toc = article.sections.map((section) => (
    `<li><a href="#${esc(section.id)}">${esc(section.heading)}</a></li>`
  )).join("");
  const sections = article.sections.map((section) => {
    const list = section.list
      ? `<ul>${section.list.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`
      : "";
    return `<section id="${esc(section.id)}"><h2>${esc(section.heading)}</h2>${paragraphHtml(section.paragraphs)}${list}</section>`;
  }).join("");
  const faqs = article.faqs.length
    ? `<section><h2>Questions</h2>${article.faqs.map((item) => `<h3>${esc(item.question)}</h3><p>${esc(item.answer)}</p>`).join("")}</section>`
    : "";
  return `<main><nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog">Blog</a> / <span>${esc(article.h1)}</span></nav><p><a href="/blog">Back to Blog</a></p><h1>${esc(article.h1)}</h1><p>By ${esc(article.author)} · ${esc(formatBlogDate(article.datePublished))}</p><img src="${esc(article.featuredImage)}" alt="${esc(article.featuredImageAlt)}" /><p>${esc(article.category)}</p>${paragraphHtml(article.introduction)}<nav aria-label="On this page"><h2>On this page</h2><ol>${toc}</ol></nav>${sections}${faqs}${relatedHtml(article)}</main>`;
}

function listingHtml() {
  const cards = ARTICLES.map((article) => (
    `<article><p>${esc(article.category)}</p><h2><a href="/blog/${esc(article.slug)}">${esc(article.title)}</a></h2><p>${esc(article.excerpt)}</p><img src="${esc(article.featuredImage)}" alt="${esc(article.featuredImageAlt)}" /><p>${esc(formatBlogDate(article.datePublished))}</p><p><a href="/blog/${esc(article.slug)}">Read article</a></p></article>`
  )).join("");
  return `<main><nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Blog</span></nav><h1>${esc(BLOG_LISTING.h1)}</h1><p>${esc(BLOG_LISTING.introduction)}</p>${cards}</main>`;
}

function missingHtml() {
  return `<main><h1>Article not found</h1><p>This Mizazy guide is not available.</p><p><a href="/blog">Back to Blog</a></p></main>`;
}

export function renderBlogBody(pathname) {
  const match = matchBlogPath(pathname);
  if (!match) return null;
  if (match.kind === "listing") return listingHtml();
  if (match.kind === "article") return articleHtml(match.article);
  return missingHtml();
}
