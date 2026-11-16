const psoriasis='https://www.aad.org/public/diseases/psoriasis/what/symptoms';
const psoriasisCare='https://www.aad.org/public/diseases/psoriasis/insider/tips';
const psoriasisGuideline='https://www.aad.org/member/clinical-quality/guidelines/psoriasis';
const rosacea='https://www.aad.org/public/diseases/rosacea/what-is/symptoms';
const rosaceaCare='https://www.aad.org/public/diseases/rosacea/triggers/tips';
const rosaceaTriggers='https://www.aad.org/public/diseases/rosacea/triggers/find';
const rosaceaEyes='https://www.aad.org/public/diseases/rosacea/treatment/diagnosis-treat';
const rosaceaTone='https://www.aad.org/public/diseases/rosacea/what-is/skin-color';
const contact='https://www.aad.org/public/diseases/eczema/types/contact-dermatitis';
const ivy='https://www.aad.org/public/everyday-care/itchy-skin/poison-ivy/treat-rash';
const hives='https://www.aad.org/public/diseases/a-z/hives-symptoms';
const urticaria='https://pmc.ncbi.nlm.nih.gov/articles/PMC13466004/';
const anaphylaxis='https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/special-circumstances-guidelines';
const vitiligo='https://www.niams.nih.gov/health-topics/vitiligo';
const vitiligoCare='https://www.aad.org/public/diseases/a-z/vitiligo-self-care';
const scar='https://www.aad.org/public/diseases/a-z/keloids-overview';
const scarCare='https://www.aad.org/public/diseases/a-z/keloids-treatment';
const burn='https://www.ameriburn.org/burn-care-team/resources/guidelines-for-burn-patient-referral';
const burnFirstAid='https://www.rch.org.au/clinicalguide/guideline_index/Burns_Acute_Management/';
const burnWound='https://msktc.org/burn/factsheets/wound-care-after-burn-injury';
const burnItch='https://msktc.org/burn/factsheets/itchy-skin-after-burn-injury';
const burnScar='https://msktc.org/burn/factsheets/scar-management-after-burn-injury';
const exercise='https://msktc.org/burn/factsheets/exercise-after-burn-injury';
const splint='https://www.chelwest.nhs.uk/your-visit/patient-leaflets/burns/splints';
const carbonMonoxide='https://www.cdc.gov/carbon-monoxide/hcp/clinical-guidance/index.html';
const melanoma='https://www.aad.org/public/diseases/skin-cancer/types/common/melanoma/symptoms';
const nail='https://www.aad.org/public/diseases/skin-cancer/types/common/melanoma/nail-melanoma';
const basal='https://www.aad.org/public/diseases/skin-cancer/basal-cell-carcinoma';
const pressure='https://www.internationalguideline.com/classification';
const pressureAssessment='https://www.internationalguideline.com/assessment';
const pressureManagement='https://www.healthquality.va.gov/HEALTHQUALITY/guidelines/WRC/PIP/PIP-CPG_2026-Guideline_Final_20261020.pdf';
const isolation='https://www.cdc.gov/infection-control/hcp/isolation-precautions/appendix-a-type-duration.html';
const scabies='https://www.cdc.gov/scabies/php/public-health-strategy-crusted/index.html';
const necrotizing='https://www.cdc.gov/group-a-strep/hcp/clinical-guidance/necrotizing-fasciitis.html';
const electrical='https://www.salisbury.nhs.uk/media/kgklfbxt/british-burn-association-first-aid-clinical-practice-guidelines.pdf';

// Choice order matches the source index used by saved answer records.
const skin={
 1:[psoriasis,[
  ['Use contact isolation until all plaques disappear','Contact isolation can be indicated for a transmissible skin infection. The plaque distribution is consistent with psoriasis, which is not communicable.'],
  ['Use standard precautions and arrange assessment for psoriasis','Symmetric scaly plaques on the extensor elbows and scalp suggest psoriasis. Use routine linen handling and assess the skin rather than labeling the plaques contagious.'],
  ['Ask the household to begin antifungal treatment','Antifungal treatment may be appropriate for confirmed fungal disease. The patient needs assessment before assigning that diagnosis or treating household members.'],
  ['Scrub the plaques so their borders can be seen','Inspect and document appearance gently. Scrubbing inflamed skin can injure it and does not establish the diagnosis.'],
 ]],
 2:[psoriasisGuideline,[
  ['Report the persistent joint symptoms for evaluation','Morning stiffness and swollen fingers raise concern for inflammatory arthritis, including psoriatic arthritis. Skin improvement does not establish joint control.'],
  ['Continue the cream and reassess only the plaques','Monitoring plaques is useful for topical response. The joint symptoms require a separate assessment.'],
  ['Apply more of the same cream over each swollen joint','Apply prescribed topicals to the listed skin areas. Increasing a topical dose does not assess or treat suspected arthritis.'],
  ['Recommend rest until the next annual visit','Temporary rest may help symptoms, but persistent inflammatory features warrant earlier assessment to limit loss of function.'],
 ]],
 3:[psoriasisCare,[
  ['A bacterial infection is confirmed by the linear pattern','A spreading hot or painful area or fever would raise concern for infection. A line of typical plaques along a scratch does not establish it.'],
  ['The watch clasp transferred psoriasis from another person','Consider cleaning equipment according to routine hygiene. Psoriasis is not transferred by touching an object.'],
  ['Scratching will remove the cause and prevent recurrence','Protect the area and use the prescribed skin-care plan. Further scratching can aggravate the injury and provoke new lesions.'],
  ['Skin trauma can trigger psoriasis at the injured site','New lesions along a scratch can represent the Koebner phenomenon. Teaching should focus on minimizing skin injury and watching for changes.'],
 ]],
 4:[psoriasisCare,[
  ['Extend the hot shower to loosen the plaques','Soaking may soften scale, but a long hot shower can dry and irritate the skin. Use a short lukewarm shower.'],
  ['Use a coarse scrub before applying the medication','Some patients have prescribed scale-softening treatments. Abrasive scrubbing can traumatize plaques and worsen irritation.'],
  ['Use lukewarm water and moisturize gently after bathing','Lukewarm bathing and fragrance-free moisturizer help limit dryness and tightness. Follow the individual instructions for timing prescribed topical medicines.'],
  ['Stop moisturizers when the prescribed treatment starts','A product that causes irritation should be reviewed. A tolerated moisturizer often remains part of psoriasis care alongside treatment.'],
 ]],
 5:[psoriasisGuideline,[
  ['Use a tanning bed until the plaques redden','Redness can signal UV injury. Deliberately burning the skin is unsafe and does not reproduce controlled treatment.'],
  ['Continue the prescribed phototherapy with clinical supervision','Medical phototherapy uses a selected wavelength and dose with monitoring. Ask the treating team before changing the plan.'],
  ['Switch if the tanning salon advertises mild lamps','Some patients use a prescription home phototherapy device under supervision. A commercial bed is not equivalent to prescribed equipment.'],
  ['Use unmeasured midday sun instead of scheduled treatments','Clinicians may advise an individualized light exposure plan in some situations. Unmeasured midday exposure adds burn and skin-cancer risk.'],
 ]],
 6:[psoriasis,[
  ['Arrange immediate medical assessment for a severe widespread eruption','Generalized redness, peeling and chills raise concern for erythroderma or another serious eruption. Assess vital signs and temperature and escalate urgently.'],
  ['Arrange a routine refill of the current topical treatment','Routine refills are appropriate in stable disease. Widespread new skin changes with chills represent an acute change.'],
  ['Suggest a hot bath at home while monitoring the rash','Gentle bathing can help stable plaque symptoms. This patient needs immediate assessment for impaired temperature regulation and systemic illness.'],
  ['Arrange a cosmetic consultation at the next visit','Cosmetic goals can be discussed when medically stable. They do not address this potentially life-threatening presentation.'],
 ]],
 7:[psoriasis,[
  ['Chart a confirmed nail fungal infection from appearance alone','Nail fungi may produce dystrophy and can coexist with psoriasis. Confirmation requires appropriate evaluation, often with a nail sample.'],
  ['Chart nail color and omit surface and attachment findings','Color is useful to record, but pits and onycholysis are distinctive observations that should be described.'],
  ['Exclude psoriasis because more than one nail is affected','Psoriasis can affect multiple nails. Combine nail findings with the skin and joint history.'],
  ['Document nail pitting and separation with the skin and joint findings','Pitting and separation from the nail bed can occur in nail psoriasis. Objective descriptive documentation supports evaluation without assuming the only cause.'],
 ]],
 8:[psoriasisGuideline,[
  ['Use the same thick amount on the face and body','Prescribed amounts, products and potency can differ by site. A uniform thick layer increases inappropriate exposure.'],
  ['Double the amount on days after a missed application','Use missed-dose directions for the prescribed product. Extra topical medication may increase adverse effects without restoring the schedule.'],
  ['Review the prescribed amount, site and schedule using teach-back','The current pattern is inconsistent and uses extra medication. Check exactly how and when the patient will apply each product.'],
  ['Review application only when the next flare starts','Flare teaching can be useful, but clarify the ongoing plan now so the patient can follow it and raise barriers.'],
 ]],
 9:[rosacea,[
  ['Focus the assessment on plugged pores','Comedones support acne when present. Recurrent central facial flushing, burning and visible vessels suggest considering rosacea.'],
  ['Assess for rosacea and ask about triggers and eye symptoms','The combination of flushing, visible vessels and acne-like bumps without obvious comedones fits possible rosacea. Eye symptoms can accompany it.'],
  ['Classify the eruption as acute urticaria','Urticaria produces transient raised wheals. The described facial symptoms recur with flushing and vessels rather than appearing as migrating wheals.'],
  ['Manage the bumps as a contagious skin infection','Pustules may require evaluation for infection when findings support it. The pattern here calls for rosacea assessment, and rosacea does not spread to others.'],
 ]],
 10:[rosaceaCare,[
  ['Use shade, protective clothing and a tolerated broad-spectrum sunscreen','Sun is a reported trigger. Combine shade and a broad-brimmed hat with a tolerated broad-spectrum sunscreen of SPF 30 or higher.'],
  ['Use makeup instead of the sun-protection plan','Makeup can camouflage redness. It only provides adequate UV protection if it is protective and applied appropriately, and ordinary coverage alone is insufficient.'],
  ['Apply sunscreen only once the skin feels sunburned','Sunscreen works preventively before exposure and needs reapplication as directed. Burning signals that damage may already have occurred.'],
  ['Warm the face with a mask before going outside','A warm compress may be recommended in some eyelid-care plans. Facial heat can trigger a flare, so it does not address the sun exposure.'],
 ]],
 11:[rosaceaCare,[
  ['Use firmer pressure with the cleansing brush','Gentle cleansing removes dirt without friction. The brush already provokes stinging and firmer pressure can aggravate it.'],
  ['Continue the alcohol toner until the skin adjusts','Some prescribed products are introduced on an individualized schedule. Alcohol-based toner is an avoidable irritant when it causes stinging.'],
  ['Swap the toner for a fragranced exfoliating cleanser','Replacing one irritant with fragrance or an exfoliant can worsen sensitivity. Use a bland product the skin tolerates.'],
  ['Cleanse gently with fingertips and stop the products that sting','Use a mild cleanser, rinse gently and avoid abrasive tools and products linked to symptoms. Review persistent irritation with the care team.'],
 ]],
 12:[rosaceaEyes,[
  ['Apply the facial medicine to the inner eyelid','Use eye preparations specifically prescribed for the eye. A topical facial drug may irritate the ocular surface.'],
  ['Treat the symptoms as unrelated because the facial skin is the only site involved','Rosacea can affect the eyes even when skin findings are mild. Pain, photophobia and visual change need assessment for ocular disease or another cause.'],
  ['Arrange urgent eye assessment','New eye pain with light sensitivity and blurred vision can indicate corneal involvement or another sight-threatening problem. Do not wait for the facial flare to clear.'],
  ['Try routine eyelid hygiene and reassess at the next skin visit','Hygiene may be part of clinician-directed care for milder eyelid symptoms. It cannot substitute for urgent assessment with visual change and pain.'],
 ]],
 14:[rosaceaTriggers,[
  ['Record exposures and flare timing to identify a personal pattern','Individual triggers vary. Tracking foods, temperatures, products and symptoms can reveal repeated associations that guide targeted changes.'],
  ['Cut out every suspected food indefinitely','Selective avoidance may help after a reproducible trigger is identified. Broad restriction without a pattern creates avoidable burden.'],
  ['Log symptoms only if a flare becomes severe','Severe flares deserve review. Milder symptoms also provide timing information that helps identify triggers.'],
  ['Change meals and skin treatments together each day','Multiple simultaneous changes make it difficult to identify what helps. Keep prescribed treatment stable unless the clinician directs a change.'],
 ]],
 15:[rosaceaTone,[
  ['Exclude rosacea unless bright redness is visible','Redness can be harder to see in darker skin. Burning, warmth, texture and subtle color changes may be more apparent.'],
  ['Record a fever from the reported facial warmth','Measure temperature if systemic fever is suspected. Local warmth is a symptom, not a measured fever.'],
  ['Use a single bright-light photograph to settle the diagnosis','A comparable photo may document a change. It should accompany a history and direct assessment rather than replace them.'],
  ['Assess discomfort, texture and change from baseline in good light','Consider flushing triggers, papules, swelling and ocular symptoms along with color change. This avoids relying on one visible sign.'],
 ]],
 16:[contact,[
  ['Keep the metal against the rash to build tolerance','Supervised desensitization may be used for some allergies. Continued contact with a suspected trigger can worsen contact dermatitis.'],
  ['Begin an antibiotic cream as the only intervention','Antibiotics may be indicated for secondary bacterial infection. A localized itchy geometric rash after contact calls for exposure avoidance and assessment.'],
  ['Prevent skin contact with the fastener and arrange review if symptoms persist','A rash that matches the fastener suggests contact dermatitis. Removing the exposure helps while the clinician determines whether it is irritant or allergic.'],
  ['Tell the household to avoid sharing clothing because of this rash','Transmission precautions are appropriate for some infectious rashes. Contact dermatitis is a reaction to exposure and is not transmitted by the rash.'],
 ]],
 17:[contact,[
  ['Use a stronger solvent to remove detergents after each job','Gentle cleaning can remove residue. A stronger solvent can further damage the skin barrier.'],
  ['Limit detergent exposure using suitable gloves and moisturize after washing','Repeated wet work and detergent exposure support irritant hand dermatitis. Use appropriate dry protective gloves and apply a tolerated moisturizer.'],
  ['Keep the same wet gloves on to reduce contact with air','Gloves protect when suitable for the task and dry inside. Change damp liners or gloves as needed to avoid continued wet exposure.'],
  ['Replace required hand hygiene with a fragranced product','Hand hygiene should follow workplace requirements. Review tolerated products without substituting a fragranced irritant or skipping required hygiene.'],
 ]],
 18:[contact,[
  ['Patch testing with delayed readings','Patch testing is designed to detect a delayed cutaneous response to contact allergens. A clinician selects relevant substances and interprets the readings.'],
  ['Skin-prick testing read within minutes','Immediate testing can help evaluate selected immediate hypersensitivity. This history asks about delayed contact allergy.'],
  ['A bacterial culture of an unaffected patch of skin','Culture is considered when there are signs of bacterial infection. It does not identify which cosmetic provokes delayed dermatitis.'],
  ['An at-home re-exposure to several products together','A specialist may direct a limited use test for particular products. Unsupervised multiple exposures can cause another flare and are difficult to interpret.'],
 ]],
 19:[contact,[
  ['Reapply the same adhesive to maintain the dressing','Securement matters, but a rash that follows the adhesive shape raises concern for exposure-related irritation or allergy. Review alternatives.'],
  ['Leave the incision unprotected without reviewing the order','Some incisions may later be left open to air under instructions. Assess the wound and follow the existing care requirements before changing protection.'],
  ['Document an established incision infection from the outline','Spreading warmth, worsening pain, fever or purulent drainage would raise concern. An itchy outline on adjacent intact skin does not diagnose infection.'],
  ['Report the reaction and select appropriate alternative securement with the team','Remove or replace the suspected trigger as directed while maintaining wound protection. Document the distribution and check for separate wound complications.'],
 ]],
 20:[ivy,[
  ['Avoid contact with household members until the visible rash dries','Covering lesions may improve comfort in some cases. Blister fluid does not spread the rash. Contaminated oil on clothing or tools can cause new exposure.'],
  ['Open the blisters to remove the plant oil','Clean exposed skin and equipment after contact. Opening blisters does not remove the cause and can injure skin.'],
  ['Clean the gloves and equipment that may still carry plant oil','Urushiol can remain on gear and transfer to skin. Wash contaminated items and avoid handling them against bare skin until cleaned.'],
  ['Keep using the unwashed gloves until symptoms resolve','Clean gloves can protect against further contact. Reusing contaminated gloves can trigger another reaction.'],
 ]],
 21:[contact,[
  ['Continue home care and wait until the itching stops','Stable itching may improve with avoidance and symptom care. New warmth, pain and drainage raise concern for infection that needs assessment.'],
  ['Arrange assessment for secondary infection','Scratching can break the skin barrier. Evaluate the new findings and escalate fever, rapid spreading redness or systemic illness.'],
  ['Place the original trigger over the broken skin','A suitable covering can protect damaged skin. The known trigger can worsen the reaction and should be avoided.'],
  ['Record the draining area as clearly healed','Some dermatitis can weep without bacterial infection. Increasing pain and warmth with new drainage require reassessment before judging recovery.'],
 ]],
 22:[contact,[
  ['Choose a fragrance-free product and check the ingredient list','Compare ingredients against the known allergen or a clinician-provided safe list. Labels alone do not establish that the product is suitable.'],
  ['Buy any product labeled unscented','An unscented product may still contain masking fragrance. Check the actual ingredients when avoiding an identified allergen.'],
  ['Use any product labeled natural','Natural extracts can contain allergens. The label does not establish safety for the individual.'],
  ['Test daily exposure to the known allergen at home','Specialist testing can clarify an uncertain exposure. Deliberately reapplying a confirmed allergen can provoke another reaction.'],
 ]],
 23:[hives,[
  ['The total area covered at noon','Extent helps describe severity. It does not show whether the wheals at noon were the same lesions seen in the evening.'],
  ['The exact color of the wheals at noon','Color helps document the eruption and can vary by skin tone. The duration of each spot is more useful for this pattern.'],
  ['Whether scratching leaves linear marks','A reproducible raised line after light stroking can suggest dermographism. The case describes spontaneous wheals in changing locations.'],
  ['How long each wheal stays in the same spot','Typical wheals resolve individually within 24 hours even when new ones appear. A painful, bruising or fixed lesion calls for review for other causes.'],
 ]],
 24:[anaphylaxis,[
  ['Give an oral antihistamine and observe','An antihistamine can help isolated itching or wheals. It cannot treat threatened airway or breathing after medication exposure.'],
  ['Obtain a detailed allergy history before treating','Reviewing the exposure and allergy history helps future prevention. Hoarseness and trouble breathing require treatment before detailed history-taking.'],
  ['Activate emergency help and give intramuscular epinephrine per protocol','Skin symptoms with hoarseness and breathing difficulty after a drug suggest anaphylaxis. Early intramuscular epinephrine and emergency assessment address the airway and circulatory risk.'],
  ['Give an inhaled bronchodilator as the only treatment','A bronchodilator can supplement epinephrine for persistent bronchospasm. It does not treat laryngeal swelling or shock.'],
 ]],
 25:[urticaria,[
  ['A prolonged episode of contact dermatitis','Contact dermatitis generally follows an exposure pattern and its patches can persist. Recurrent short-lived wheals suggest a different process.'],
  ['A pattern consistent with chronic urticaria','Wheals occurring intermittently over more than six weeks fit chronic urticaria if the lesions are confirmed. They do not need to occur every day.'],
  ['Separate acute episodes because there are symptom-free days','An isolated course of up to six weeks is acute urticaria. Intermittent episodes across two months still warrant assessment as a chronic pattern.'],
  ['Fixed lesions because the eruption has lasted two months','Record each wheal’s duration separately from the duration of the overall illness. The photos and symptom history describe wheals that come and go.'],
 ]],
 26:[urticaria,[
  ['Photograph new wheals and log the time and possible exposures','A photo can show the shape of lesions absent at the visit. Timing, location, individual duration and recent exposures help characterize the episodes.'],
  ['Record only the number of patches visible at clinic visits','Counting visible lesions can help gauge activity. The eruption has cleared before appointments, so this alone would miss the pattern.'],
  ['Photograph unaffected skin once the episode ends','A baseline image can show comparison skin. Images from when the wheals are visible provide the most relevant evidence here.'],
  ['Reintroduce suspected medicines at home before the next visit','Allergy testing or a challenge may sometimes be arranged by a specialist. Unsupervised re-exposure is unsafe if a drug reaction is possible.'],
 ]],
 27:[hives,[
  ['Avoid hugging until the wheals have crusted','Some infectious rashes have precautions tied to crusting. Ordinary urticarial wheals fade without crusting and are not passed to others by touch.',isolation],
  ['Use separate towels until all wheals disappear','Separate linens can reduce transmission for certain infestations or infections. The wheals described are not spread by linens.',scabies],
  ['Ask household members to take allergy medicine to prevent spread','Treat symptoms in the person affected when indicated. Medicine for unaffected household members does not prevent urticaria or address any shared exposure.'],
  ['Explain that the wheals themselves do not spread by hugging','Hives are a skin response. A shared exposure may affect more than one person, but touching another person’s wheals does not transmit them.'],
 ]],
 29:[vitiligo,[
  ['Use separate utensils until the patches regain pigment','Separate items can be indicated for certain transmissible conditions. Loss of pigment from vitiligo does not spread through utensils.'],
  ['Explain that suspected vitiligo is noncontagious and arrange assessment','Smooth depigmented patches can fit vitiligo. It involves loss of pigment-producing cells, so routine sharing of utensils does not transmit it.'],
  ['Start an antifungal on everyone who shared utensils','Antifungal treatment is for a confirmed or suspected fungal condition in the person affected. It is not indicated from this description alone.'],
  ['Assume that the distribution confirms vitiligo','Distribution helps with diagnosis. Assessment can distinguish vitiligo from other causes of pallor or depigmentation before a treatment is chosen.'],
 ]],
 30:[vitiligoCare,[
  ['Use sun protection and offer camouflage options if desired','Depigmented skin burns readily. Tanning surrounding skin can accentuate the contrast. Protective clothing and sunscreen reduce UV exposure, and camouflage is optional.'],
  ['Tan the lighter patches gradually without sunscreen','Medical phototherapy uses measured exposure under a treatment plan. Recreational UV exposure without protection can burn the depigmented skin.'],
  ['Put sunscreen only on the normally pigmented skin','Full sun protection includes exposed depigmented skin. A cover-up, shade, and protection on all exposed skin suit the beach setting.'],
  ['Rely on cosmetic camouflage alone for UV protection','Camouflage addresses appearance. Use reliable sun protection as well unless the product provides and is applied for adequate UV protection.'],
 ]],
 31:[vitiligoCare,[
  ['Tell the client to avoid discussing the skin changes at work','Privacy is the client’s choice. Directing silence ignores the expressed concern and prevents discussion of ways to manage unwanted attention.'],
  ['Provide cosmetic products without asking what the client wants','Camouflage may help a person who chooses it. Ask about the impact and priorities before assuming coverage is the main goal.'],
  ['Schedule medical review only if the affected area grows','Clinical follow-up can address spread and treatment options. Distress and disruption of daily life also deserve attention when raised.'],
  ['Ask how work is affected and offer resources based on the client’s preferences','Explore distress and goals before recommending a support group, counseling, practical language for workplace questions, or camouflage.'],
 ]],
 32:[vitiligo,[
  ['Classify the patch as routine vitiligo progression','New smooth depigmentation could fit progression. Itch and scale are different features and warrant a fresh examination.'],
  ['Increase the existing vitiligo medicine over the new patch','Treatment may be adjusted for confirmed vitiligo activity. A lesion with new surface findings could require different treatment.'],
  ['Arrange assessment of the new itchy, scaly patch','A new scaly lesion can have a separate cause such as dermatitis or a superficial fungal condition. Examine it before extending the existing treatment.'],
  ['Expect sun protection alone to resolve the lesion','Protection helps reduce sunburn with vitiligo. It does not diagnose or treat the new itchy scale.'],
 ]],
 33:[vitiligo,[
  ['Increase skin camouflage at the next visit','Camouflage can address appearance. It does not evaluate fatigue, constipation, or cold intolerance.'],
  ['Report the symptom cluster for thyroid assessment','Vitiligo can coexist with autoimmune thyroid disease. Cold intolerance, constipation, and fatigue support asking the clinician to assess thyroid function.'],
  ['Treat the cold intolerance as proof of vitamin D deficiency','Diet and vitamin D status may merit attention in selected patients. The reported symptoms do not diagnose a deficiency and warrant broader assessment.'],
  ['Wait for another patch before mentioning the symptoms','Skin changes should be monitored separately. The new systemic symptoms warrant review even when the patches are unchanged.'],
 ]],
 34:[scar,[
  ['Growth past the original wound borders','Keloid tissue extends outside the area originally injured. The scar confined to the incision fits the distribution of a hypertrophic scar.'],
  ['Height above the surrounding skin','Both keloids and hypertrophic scars can be raised. Look at whether the tissue extends beyond the wound.'],
  ['Firmness compared with nearby skin','Either raised scar can feel firm. Border extension is the more useful distinguishing feature here.'],
  ['Itching with contact from clothing','Either type of scar can itch or be sensitive. Symptoms help describe burden but do not distinguish these two lesions by themselves.'],
 ]],
 35:[scar,[
  ['Choose a smaller stud to remove the risk','Jewelry fit affects irritation and pressure. Even a small piercing creates a new skin injury that can trigger a keloid.'],
  ['Pierce the other ear to avoid the tendency to scar','Using the other ear avoids the existing scar. The patient can still form a keloid at a new site.'],
  ['Use a sterile needle to prevent scar overgrowth','Sterile technique prevents contamination. It does not eliminate excess scarring after an injury.'],
  ['Discuss the recurrence risk before deciding whether to pierce again','A personal history of keloid indicates susceptibility after further injury. Avoiding another elective piercing lowers that avoidable risk.'],
 ]],
 36:[scarCare,[
  ['Apply the sheet directly over the open area now','Some silicone wound dressings are specifically made for open wounds. A prescribed sheet for scar management belongs on intact, healed skin.'],
  ['Use the scar sheet to close the incision','An open incision needs the prescribed wound-care plan and assessment if healing is delayed. A scar sheet does not bring wound edges together.'],
  ['Wait until the incision is fully closed and the wound team clears use','Silicone sheeting for scars is used on healed skin. Until then, follow the wound plan and ask about timing if the open area persists.'],
  ['Replace the current dressing once the edges feel dry','Dry edges alone do not establish that the incision has closed. Continue the current wound dressing as ordered.'],
 ]],
 37:[scarCare,[
  ['Expect removal alone to prevent recurrence','Excision may reduce bulk or improve symptoms. A keloid can grow again after surgery, especially when excision is the only treatment.'],
  ['Discuss recurrence and a plan for additional treatment and follow-up','An individualized plan can include surgery with pressure therapy, injections or another adjunct. The aim is to reduce recurrence and monitor healing.'],
  ['Expect home massage to prevent recurrence by itself','Prescribed massage can sometimes help comfort in scar rehabilitation. It is not established as the sole prevention after a keloid excision.'],
  ['Stop follow-up once the stitches are removed','Early wound checks matter after surgery. Reassessment later can detect new growth while options remain available.'],
 ]],
 38:[burn,[
  ['Count the blistered area only','Count partial-thickness and deeper burns in the TBSA estimate. Superficial, nonblistered redness is documented separately.'],
  ['Count the blistered area and the dry, red area','Combining areas is appropriate when each has partial-thickness or deeper injury. The separate superficial area is excluded.'],
  ['Count the dry, red area only','Dryness can also occur in deep burns. Dry redness that blanches without blistering is described here as superficial, while the blistered area qualifies.'],
  ['Wait to count either area until wounds are uncovered at the receiving facility','Estimates can be refined after transfer. Report the area that can be assessed now to support initial management and handover.'],
 ]],
 39:[burn,[
  ['Superficial epidermal burn','Epidermal burns are often dry and red and blanch. Blisters and a moist surface indicate injury into the dermis.'],
  ['Deep partial-thickness burn','Deeper dermal burns are often paler or drier, have reduced blanching, and can have reduced sensation. The brisk blanch and severe tenderness favor a more superficial dermal burn.'],
  ['Full-thickness burn','Full-thickness areas are often dry, leathery and relatively insensate. The described moist, blanching site does not fit that pattern.'],
  ['Superficial partial-thickness burn','Moist blistering skin with brisk blanching and marked tenderness fits injury into the superficial dermis. Reassess depth as the wound evolves.'],
 ]],
 40:[burn,[
  ['Continue the original plan without reassessing depth','Routine follow-up can be reasonable for an unchanged shallow burn. Loss of blanching and sensation warrants reassessment now.'],
  ['Reclassify the area as healed because pain has decreased','Decreasing pain can accompany healing, but pallor, dryness and reduced sensation together may indicate deeper injury.'],
  ['Report the change and request reassessment for a deeper burn','A pale, dry area with diminished blanching or sensation can indicate deeper dermal damage. The team should reevaluate depth and decide on burn-center consultation.'],
  ['Wait for the patch to become black before escalating','Black eschar may be present in deeper burns, but deeper injury can look pale. The change in perfusion and sensation already warrants review.'],
 ]],
 41:[burn,[
  ['Superficial injury because the edges remain painful','Pain around the wound reflects the surrounding tissue. The dry, insensate center can have a substantially different depth.'],
  ['Possible full-thickness injury at the center','A leathery area with absent pinprick sensation supports full-thickness injury. Report mixed depths and request prompt burn specialist consultation.'],
  ['Superficial partial-thickness injury throughout','This usually blanches and is moist and tender. Those features are absent in the center.'],
  ['Healed dermis with a normal temporary loss of sensation','Scar sensation may change during recovery. A dry, leathery area on an acute burn with absent sensation requires assessment for deep injury.'],
 ]],
 42:[burn,[
  ['Seek immediate burn-center consultation and discuss transfer','A deep partial-thickness injury of the hand or over a joint can threaten function even with a small area. The American Burn Association includes it among injuries needing immediate consultation.'],
  ['Manage solely with routine follow-up because the area is below 10%','Small superficial injuries without referral factors may be managed locally. Depth and location independently matter here.'],
  ['Arrange hand therapy only after the wound closes','Rehabilitation helps protect motion, but it does not replace early assessment of a deep burn over the hand and joint.'],
  ['Refer only if wound infection develops','Infection can warrant escalation later. Potential loss of motion and deep injury already indicate specialist input.'],
 ]],
 43:[burn,[
  ['Wound pain as the only cause of hoarseness','Pain and anxiety can increase respiratory rate. They do not explain away new hoarseness and soot after enclosed smoke exposure.'],
  ['Reassuring oxygenation based on the finger reading','A conventional pulse oximeter can overestimate effective oxygenation during carbon monoxide exposure. It also cannot rule out evolving upper-airway injury.',carbonMonoxide],
  ['Delayed reassessment after local burn dressings','Skin care can follow stabilization. Airway swelling can progress, so waiting until dressings are finished is unsafe.'],
  ['Suspected inhalation injury requiring immediate evaluation','Enclosed smoke exposure, soot and hoarseness are airway warning signs. Escalate immediately for airway and toxic inhalation assessment regardless of the displayed saturation.'],
 ]],
 44:[burn,[
  ['Describe the injury as superficial based on the two marks','Document the visible wounds, but electrical current can cause deeper tissue injury out of proportion to the visible marks.'],
  ['Delay referral until a skin wound becomes larger','Some burn wounds evolve over time. High voltage already warrants immediate consultation, regardless of early cutaneous appearance.'],
  ['Identify high-voltage exposure and request immediate burn-center consultation','The mechanism raises concern for occult tissue injury and electrical complications. Include cardiovascular and trauma findings in the initial handover.'],
  ['Discuss scar appearance as the main acute concern','Skin healing can be reviewed later. Acute evaluation should prioritize electrical complications, deep tissue damage, and associated trauma.'],
 ]],
 45:[burn,[
  ['18%','This is the adult anterior trunk only. It omits the entire right arm, which contributes another 9%.'],
  ['27%','The anterior trunk contributes 18% and the entire arm 9%. Include all the described partial-thickness areas for 27% of total body surface area.'],
  ['36%','This would count the anterior trunk and both entire arms. Only the right arm is involved.'],
  ['45%','This would count both the front and back of the trunk plus the entire right arm. The back is unaffected.'],
 ]],
 46:[burnFirstAid,[
  ['Use an age-adjusted Lund and Browder chart','Children have different proportions of head and leg surface area. Age-adjusted estimates account for both affected regions.'],
  ['Use the adult rule of nines without adjustment','The adult rule can give a rapid adult estimate. It can misestimate a preschool child’s scalp and leg involvement.'],
  ['Use the examiner’s palm as a fixed percentage for the entire assessment','The patient’s own palmar surface may help estimate small, scattered burns. An examiner’s hand and a large continuous body region are unsuitable here.'],
  ['Estimate from the child’s weight alone','Weight helps calculate weight-based treatment once severity is assessed. It does not identify the percentage of skin involved.'],
 ]],
 47:[burn,[
  ['Schedule routine review without changing the pain plan','Routine follow-up fits a stable patient whose pain is controlled and who has no referral criteria. Severe pain despite treatment warrants reassessment now.'],
  ['Wait to seek advice until the wound reaches 10% TBSA','Area contributes to referral decisions, but separately listed factors such as poor pain control can warrant consultation at a lower TBSA.'],
  ['Use a small surface estimate to rule out complications','Area helps describe extent. It cannot explain uncontrolled pain or exclude depth, difficult dressing care, or another complication.'],
  ['Consult the burn center for poorly controlled pain','Persistent severe pain despite the prescribed regimen warrants reassessment and meets a burn-center consultation criterion.'],
 ]],
 48:[burnWound,[
  ['Wait for the routinely scheduled dressing visit','Routine follow-up is appropriate when the wound is healing without warning signs. Spreading redness, new drainage and increasing pain warrant earlier review.'],
  ['Apply scar moisturizer over the draining wound','Moisturizer is for closed skin as directed. Using it on new drainage can delay assessment of a possible infection.'],
  ['Contact the burn team promptly for wound assessment','Spreading warmth and redness with more pain and new drainage can signal infection. Follow the team’s urgent care instructions, especially if systemic symptoms appear.'],
  ['Tighten the bandage over the area overnight','Prescribed compression may serve a rehabilitation purpose. Tightening a dressing without assessment does not treat possible infection or worsening swelling.'],
 ]],
 49:[burnWound,[
  ['Remove the dressing now and photograph the graft','Photographs can be useful at a planned dressing change if requested. Unscheduled removal can disturb a fragile graft.'],
  ['Leave the graft dressing in place until the graft team directs a change','Follow the ordered dressing and activity plan to limit friction or movement while the graft adheres. Report bleeding, a soaked dressing, or other unexpected changes.'],
  ['Start massaging the graft to check its attachment','Massage may be prescribed later for a fully healed scar. Manipulation of a newly grafted area can damage it.'],
  ['Use the donor-site dressing schedule for the graft','The two sites may use different products and schedules. Follow the instructions issued specifically for the graft.'],
 ]],
 50:[burnWound,[
  ['Use the separate dressing instructions for the donor site and graft','The donor wound and the fragile recipient graft have different healing needs. Label supplies and review the timing and warning signs for each site.'],
  ['Change both dressings whenever either becomes wet','A wet dressing may need a call or change according to its own plan. It does not mean that both sites should be uncovered.'],
  ['Apply the same ointment to both areas at every change','A wound product may be prescribed for one or both sites. Confirm the order for each; matching products cannot be assumed.'],
  ['Leave the donor site uncovered once the graft is protected','Some sites can be uncovered when healed or as directed. The graft dressing does not determine whether the donor site needs protection.'],
 ]],
 51:[burnScar,[
  ['Apply the moisturizer to both areas','This product can hydrate healed scar tissue. The draining area is still open and needs its separate wound instructions.'],
  ['Apply the moisturizer only to the draining area','Moist wound healing may use specifically ordered products. A scar moisturizer is not the treatment for an open, draining site.'],
  ['Stop the dressing after the moisturizer softens the dry skin','Softening nearby skin does not establish closure of the draining area. Continue wound coverage as directed.'],
  ['Apply the moisturizer only to the closed, dry skin','Treat the healed area with the recommended moisturization. Maintain the wound plan separately and report unexpected drainage or skin breakdown.'],
 ]],
 52:[burnItch,[
  ['Rub both the healed skin and open scratches firmly','Therapist-directed pressure or massage may help itch on intact healed skin. Rubbing broken skin can worsen injury.'],
  ['Choose a fragranced product to cover the discomfort','A bland product recommended by the team may moisturize healed skin. Fragrance can irritate fragile areas and will not assess new breaks.'],
  ['Use the burn team’s itch plan and report the skin breaks','Avoid scratching fragile skin and use recommended measures where appropriate. New breaks require wound advice and monitoring for infection.'],
  ['Put the regular scar products directly into the scratches','Products intended for intact scars are separate from treatments for open skin. The team can advise on suitable protection for the new breaks.'],
 ]],
 53:[splint,[
  ['Tighten the straps so the tender spot can settle','Securement may be adjusted according to instructions, but tightening over a new tender spot can increase pressure and injury.'],
  ['Contact the therapist promptly to review the fit and skin','New focal tenderness suggests an area of excess pressure. Follow the therapist’s guidance about wear while awaiting assessment and check for redness or breakdown.'],
  ['Heat and reshape the splint at home','Therapists use controlled methods to modify a splint. Home heating can change the fit unpredictably and cause additional injury.'],
  ['Stop all positioning and range-of-motion care indefinitely','The wearing schedule may need modification due to the pressure point. The rehabilitation team should preserve safe positioning and motion with a revised plan.'],
 ]],
 54:[exercise,[
  ['Use prescribed elbow exercises and practice dressing with rehabilitation','The scar limits range of motion and a specific daily activity. Pair appropriate stretching or movement with task practice once the team confirms the safe plan.'],
  ['Keep the elbow still in the most comfortable bent position','Temporary immobilization can protect a new graft when prescribed. With a healed scar and extension loss, prolonged flexion can worsen the limitation.'],
  ['Force full elbow extension through severe pain before dressing','Therapeutic stretching should follow the prescribed intensity and respect tissue tolerance. Forceful movement risks skin injury or pain without a sustainable gain.'],
  ['Use only camouflage to improve the scar’s appearance','Cosmetic concerns may deserve attention. Camouflage does not restore extension or improve the dressing task.'],
 ]],
 55:[burnScar,[
  ['Expose the scar without protection so the color fades','UV exposure can darken healing skin or change pigmentation. It may also burn the recently healed area.'],
  ['Apply the sunscreen only after the scar starts to redden','Sunscreen helps prevent UV injury when applied before exposure and reapplied as directed. Redness can indicate damage has occurred.'],
  ['Use an occlusive wound dressing as the only sun protection','An ordered dressing protects an open wound. For healed skin, use known UV protection such as covering clothing with sunscreen on exposed skin.'],
  ['Cover the area and apply broad-spectrum sunscreen to exposed healed skin','A recently healed burn remains sensitive to sunlight. Protective clothing, shade and sunscreen help prevent sunburn and persistent color changes.'],
 ]],
 56:[burnScar,[
  ['Reassess only if the scar breaks open','Breakdown warrants attention, but increasing tightness and impairment of hand tasks already justify functional review.'],
  ['Cover the scar with makeup as the main intervention','Camouflage can address appearance when desired. It does not resolve progressive tightening or limited movement.'],
  ['Refer back to burn rehabilitation for assessment of scar tightness and hand function','Progressive restriction can indicate contracture. A therapist can assess movement and activities and review individualized scar and exercise options.'],
  ['Buy a tighter compression garment without checking the fit','A fitted pressure garment may be prescribed. Unsupervised changes can cause pressure injury and do not assess the loss of motion.'],
 ]],
 57:[exercise,[
  ['Return to bed rest until fatigue is gone','Rest breaks can help, and new severe symptoms warrant evaluation. Routine prolonged rest after clearance can worsen deconditioning.'],
  ['Progress walking gradually and monitor tolerance with rehabilitation','After a large burn and bed rest, brief cleared activity with pauses can rebuild endurance. Adjust the plan if fatigue or other symptoms are disproportionate.'],
  ['Resume preinjury walking distance at the first session','Prior activity can guide long-term goals. Initial recovery targets should match current conditioning and restrictions.'],
  ['Use stretching as a permanent substitute for walking','Stretching can help joint mobility. Cleared walking addresses aerobic endurance, which stretching by itself does not rebuild.'],
 ]],
 58:[melanoma,[
  ['Wait until the spot exceeds 6 mm','Diameter contributes to the assessment. Melanomas can be smaller, and the changing color and shape warrant evaluation now.'],
  ['Arrange prompt evaluation of the changing spot','Evolution in shape and color is a warning sign despite small size and absence of discomfort. Document what changed and when.'],
  ['Reassure because the spot neither itches nor hurts','Symptoms can add information, but early suspicious lesions can be painless. Appearance and change drive follow-up here.'],
  ['Treat the pigmentation with an over-the-counter fading product','Cosmetic treatments may be considered for diagnosed benign pigmentation. A changing lesion needs evaluation before attempts to lighten it.'],
 ]],
 59:[nail,[
  ['Arrange prompt dermatology assessment of the widening band','A changing band in a single nail with pigment extending onto adjacent skin needs examination for possible nail melanoma. Record the evolution and show the serial photos.'],
  ['Reassure that the band must be a bruise','A subungual hemorrhage can follow trauma and often grows out with the nail. Progressive widening near the cuticle and adjacent skin pigment warrant further review.'],
  ['Start antifungal treatment and check response after a year','Nail fungal disease can cause color and texture change. This evolving band needs targeted evaluation before empiric treatment delays it.'],
  ['Monitor for pain before arranging a referral','New pain may matter, but suspicious nail pigmentation can be painless. The observed evolution is enough to warrant evaluation.'],
 ]],
 60:[basal,[
  ['Treat with an antibiotic as the only intervention','An antibiotic may be appropriate for a diagnosed bacterial infection. A recurrent shiny lesion with bleeding for months needs evaluation beyond empiric infection care.'],
  ['Observe until the lesion becomes painful','Pain is helpful to record when present, but some skin cancers are painless. Repeated crusting and bleeding already warrant assessment.'],
  ['Reassure because each crust eventually falls off','An acute minor wound should progressively heal. Repeated breakdown at the same raised area shows it has not resolved.'],
  ['Refer for evaluation of a persistent lesion that repeatedly bleeds','A shiny nonhealing lesion on sun-exposed facial skin is suspicious for a skin cancer such as basal cell carcinoma. A qualified clinician should examine it.'],
 ]],
 61:[pressureManagement,[
  ['Stage 2 pressure injury','Stage 2 describes partial-thickness pressure-related loss with exposed dermis. The widespread exposure pattern here has no clear pressure focus.'],
  ['Deep tissue pressure injury','Look for focal deep red, maroon or purple discoloration or a blood-filled blister over a site of pressure or shear. The diffuse, superficial erosions follow stool exposure.'],
  ['Incontinence-associated dermatitis','Repeated liquid stool exposure and irregular superficial erosions across the perineum and buttocks support irritant moisture damage. Use the prescribed cleansing and skin-barrier plan and reassess.'],
  ['Unstageable pressure injury','This applies when slough or eschar obscures the depth of a pressure injury. Neither an obscured wound bed nor a focal pressure pattern is described.'],
 ],'Which skin assessment best fits the findings?'],
 62:[pressure,[
  ['Stage 1 pressure injury','Stage 1 can present with intact, nonblanchable discoloration. The persistent maroon hue and boggy consistency suggest deeper damage in this case.'],
  ['Deep tissue pressure injury','Intense or prolonged heel loading can harm deeper tissue despite intact skin. The maroon color and bogginess support this classification. Offload promptly and request wound assessment.'],
  ['Stage 2 pressure injury','A shallow ulcer with exposed dermis or a serum-filled blister may be stage 2. The site described is intact with deeper discoloration.'],
  ['Incontinence-associated dermatitis','Irritant dermatitis commonly affects skin exposed to urine or stool. A localized maroon heel patch after sustained pressure fits a pressure-related mechanism.'],
 ],'Which classification best fits the heel findings?'],
 63:[pressureManagement,[
  ['Offload the heel and monitor the dry, adherent eschar','Stable heel eschar without drainage, redness or fluctuance can serve as a protective covering. Document the injury as unstageable, assess perfusion and monitor for destabilization.'],
  ['Soften the eschar to expose the wound base at the bedside','Debridement can be appropriate for selected wounds after evaluation. Stable heel eschar should remain intact, especially when perfusion is uncertain.'],
  ['Stage it as stage 4 based on the color alone','Stage 4 requires findings such as visible or directly palpable deeper structures. Black eschar obscures those findings and cannot establish stage 4.'],
  ['Apply pressure over the heel to keep the eschar attached','Pressure contributed to the injury. A correctly fitted offloading plan reduces heel loading while the team monitors the site.'],
 ],'Which plan best protects the heel while the wound base is obscured?'],
 64:[pressure,[
  ['Stage 1 cutaneous pressure injury','Stage 1 describes intact skin with pressure-related discoloration. The lesion here is an ulcer on an internal moist membrane.'],
  ['Stage 2 cutaneous pressure injury','A shallow cutaneous ulcer with exposed dermis may be stage 2. Mucosa does not use this skin-based numerical staging system.'],
  ['Unstageable cutaneous pressure injury','Unstageable cutaneous injury means slough or eschar obscures the depth of skin and tissue loss. Mucosal pressure injury uses a separate description.'],
  ['Device-related mucosal pressure injury of the inner nasal passage','The device and location explain the injury. Describe the finding and review device pressure and fit without assigning one of the skin stages.'],
 ]],
 66:[pressureAssessment,[
  ['Wait for bright redness before changing position','Visible redness may help in some skin tones. Changes in color, warmth and firmness after prolonged loading already warrant action.'],
  ['Relieve pressure and compare the site with nearby and opposite skin','New localized warmth, firmness and persistent discoloration over a bony prominence support possible early pressure damage. Reposition and complete a focused assessment.'],
  ['Massage the area to restore the usual color','Massage can serve a separate comfort goal on healthy tissue. Rubbing skin with suspected pressure injury can add tissue stress.'],
  ['Wait until the skin opens to document injury','An open area must be documented if it occurs. Pressure injury can already exist beneath intact skin, so assess and document these changes now.'],
 ]],
 67:[isolation,[
  ['Airborne, Contact and Standard Precautions','Immunosuppression plus suspected zoster requires precautions for possible dissemination until it is ruled out. A single visible dermatome does not establish containment in this situation.'],
  ['Standard Precautions with the lesions covered','This approach fits coverable localized zoster in an immunocompetent patient. Dissemination has yet to be excluded in this higher-risk case.'],
  ['Contact and Standard Precautions only','This can fit diseases primarily spread by direct or indirect contact. Possible disseminated zoster also warrants Airborne Precautions.'],
  ['Droplet and Standard Precautions only','Droplet protection is used for pathogens with the relevant transmission pattern. It does not replace Airborne and Contact Precautions for possible disseminated zoster.'],
 ]],
 68:[isolation,[
  ['Airborne and Contact Precautions until discharge','Use these precautions for disseminated zoster or initially in localized zoster in an immunocompromised patient. The case describes contained disease in an immunocompetent person.'],
  ['Leave lesions uncovered because they involve only one dermatome','Localized distribution matters, but the covered-lesions recommendation is part of the care plan. Keep them contained while vesicles remain active.'],
  ['Stop lesion coverage after the first antiviral dose','Antiviral therapy can be appropriate, but the timing of one dose does not establish that the lesions have dried and crusted.'],
  ['Cover all lesions and use Standard Precautions until they dry and crust','This fits localized, coverable zoster in an immunocompetent patient. Where feasible, assign immune caregivers over susceptible staff for direct care.'],
 ]],
 69:[scabies,[
  ['Stop Contact Precautions after the first dose','A shorter precaution period can apply to ordinary scabies after effective treatment. Crusted scabies requires continued precautions until scrapings are negative.'],
  ['Continue Standard Precautions alone once itching improves','Itching can persist or be minimal and does not establish clearance. A positive scraping supports continued contact measures.'],
  ['Continue Contact Precautions until the scrapings are negative','Crusted scabies carries a high mite burden and can spread through items as well as touch. Follow the infection prevention team’s clearance plan.'],
  ['Replace gowns and gloves with airborne isolation only','Airborne isolation serves a different transmission route. Appropriate gowns, gloves and handling precautions address spread from direct contact and contaminated items here.'],
 ]],
 70:[scabies,[
  ['Shake the bedding before placing it in a hallway cart','Sorting ordinary laundry may be part of a facility workflow. Shaking this bedding can spread infested scales or mites into the environment.'],
  ['Bag linens at the point of use and arrange hot washing and high-heat drying','Keep materials contained for transport and use the facility’s policy for laundering or isolating items. Heat helps kill mites and eggs.'],
  ['Carry uncovered linens directly to the laundry','A short route does not contain contaminated skin scales. Bag the linens where used and transport them in the designated way.'],
  ['Use an ordinary cold rinse and return the bedding immediately','Routine cold laundering is not sufficient for this scenario. Heat treatment or facility-directed sealed storage for nonwashable items is appropriate.'],
 ]],
 71:[necrotizing,[
  ['Activate emergency escalation for suspected necrotizing infection and shock','Rapid progression, pain beyond visible changes and new hypotension and confusion suggest a time-critical deep infection and poor perfusion. Urgent resuscitation and surgical assessment are needed.'],
  ['Obtain a superficial wound swab before calling for help','A swab can help assess selected superficial infections. It cannot rule out a deep infection and must not delay treating shock or getting surgical evaluation.'],
  ['Treat it as stable cellulitis and schedule reassessment the next day','A clinically stable uncomplicated infection may be managed with close follow-up. The severe pain and unstable vital signs require immediate action.'],
  ['Wait for advanced imaging to confirm the diagnosis before escalating','Imaging can assist when the diagnosis is uncertain and the patient is stable. High suspicion with shock requires emergency assessment without waiting for imaging.'],
 ]],
 72:[burnFirstAid,[
  ['Place ice directly on the scald','Cool running water is suitable for thermal burns. Ice can worsen local injury and contribute to hypothermia.'],
  ['Apply ointment before any cooling','An ordered wound product may be useful after assessment. At first aid, start cooling promptly and avoid creams or ointments.'],
  ['Immerse the student’s whole body in cold water','Cool the injured area while protecting the rest of the body from heat loss. Whole-body cooling is inappropriate for an isolated forearm scald.'],
  ['Cool the forearm with cool running water for 20 minutes','Early local cooling can limit injury and ease pain. Keep the rest of the child warm and avoid ice.'],
 ]],
 73:[electrical,[
  ['Pull the patient away by the arm immediately','Move the patient when the scene is safe. Touching someone who may still be in contact with live equipment can injure the rescuer.'],
  ['Pour water onto the equipment to cool the contact area','Cool a thermal injury when the source is controlled. Putting water on live damaged equipment creates another danger.'],
  ['Keep staff clear and have the power isolated safely before contact','Call for emergency help and safely disconnect the source or wait for qualified responders. Assess and begin indicated resuscitation as soon as contact is safe.'],
  ['Start chest compressions while the patient still touches the equipment','Begin CPR if indicated once the electrical hazard is removed. Starting while the source remains live endangers the rescuer.'],
 ]],
 74:[isolation,[
  ['Allow shared play when a dressing covers the lesions','Covering drainage can help contain spread, but it does not shorten the CDC Contact Precautions period for impetigo.'],
  ['Continue Contact and Standard Precautions until 24 hours of effective therapy','Only eight hours have elapsed. Keep the child out of shared activities until the facility’s policy permits removal of precautions at or after the recommended interval.'],
  ['Continue Airborne Precautions until the lesions disappear','Airborne isolation is appropriate for infections like disseminated zoster. Impetigo calls for Contact and Standard Precautions for the specified treatment period.'],
  ['Stop Contact Precautions as soon as the first dose is given','An effective first dose starts the 24-hour interval. Giving it does not immediately meet the criterion.'],
 ]],
};

export const skinDirectCases=Object.fromEntries(Object.entries(skin).map(([number,[source,entries,question]])=>[
 'EXP2-SKIN-'+number.padStart(3,'0'),
 {source,choices:entries.map(([choice])=>choice),reasons:entries.map(([,reason])=>reason),
  choiceSources:entries.map(([, ,reference])=>reference??source),question},
]));
