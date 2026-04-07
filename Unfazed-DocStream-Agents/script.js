document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');

    const uploadContent = document.getElementById('upload-content');
    const processingContent = document.getElementById('processing-content');
    const successContent = document.getElementById('success-content');
    const statusText = document.getElementById('status-text');
    const fileNameDisplay = document.getElementById('file-name-display');
    const resultContent = document.getElementById('result-content');
    const policyResultContainer = document.getElementById('policy-result-container');
    const newUploadBtn = document.getElementById('new-upload-btn');
    const mainContainer = document.querySelector('.container');

    let currentSessionId = null;  // shared: set by handleFile, read by openChat
    let discoveredPolicies = [];  // Store discovery results for detail view

    // (Previously hardcoded webhook constant removed, using proxy endpoint below)

    browseBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.add('drag-over'), false));
    ['dragleave', 'drop'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.remove('drag-over'), false));

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0]);
    });

    const resetFlow = () => {
        uploadContent.classList.remove('hidden');
        processingContent.classList.add('hidden');
        successContent.classList.add('hidden');
        resultContent.classList.add('hidden');
        policyResultContainer.innerHTML = '';
        fileInput.value = '';
        mainContainer.classList.remove('result-active');
        document.body.classList.remove('result-active');
    };

    if (newUploadBtn) newUploadBtn.addEventListener('click', resetFlow);

    // ─────────────────────────────────────────────────────────────────
    // KEY FIX: normaliseWebhookResponse
    // The n8n webhook sometimes returns the raw document-loader object
    // ({ metadata, pageContent }) instead of the AI-structured policy.
    // This function detects that case and extracts the structured policy
    // from whichever shape the response arrives in.
    // ─────────────────────────────────────────────────────────────────
    function normaliseWebhookResponse(raw, depth = 0) {
        if (depth > 5) return null; // Avoid excessive recursion
        if (!raw) return null;

        if (Array.isArray(raw)) {
            const firstItem = raw[0];
            if (firstItem && (firstItem.policy_name || firstItem.session_id)) return firstItem;
            for (const item of raw) {
                const found = normaliseWebhookResponse(item, depth + 1);
                if (found) return found;
            }
            return null;
        }

        if (typeof raw === 'object') {
            if (raw.policy_name || raw.session_id) return raw;

            if (raw.pageContent && raw.metadata) {
                console.warn('[WEBHOOK BUG] n8n returned raw document-loader output. Parsing text...');
                const parsed = extractPolicyFromPageContent(raw.pageContent);
                const sid = deepSearchSessionId(raw);
                if (parsed && sid) parsed.session_id = sid;
                return parsed;
            }

            if (raw.content && raw.content.parts && raw.content.parts[0]) {
                console.log('[NORMATOR] Detected Google AI Node format. Extracting parts...');
                const aiText = raw.content.parts[0].text;
                if (aiText) {
                    // Try to find if there's a JSON block inside the AI text
                    const innerJsonMatch = aiText.match(/(\{|\[)[\s\S]*(\}|\])/);
                    if (innerJsonMatch) {
                        try {
                            const innerData = JSON.parse(innerJsonMatch[0]);
                            const innerFound = normaliseWebhookResponse(innerData, depth + 1);
                            if (innerFound) return innerFound;
                        } catch (e) {}
                    }
                    // Fallback: extract from raw text
                    return extractPolicyFromPageContent(aiText);
                }
            }

            for (const val of Object.values(raw)) {
                if (val && typeof val === 'object') {
                    const found = normaliseWebhookResponse(val, depth + 1);
                    if (found) return found;
                }
            }
        }
        return null;
    }

    // New Helper: Exhaustive search for session_id in any object tree
    function deepSearchSessionId(obj) {
        if (!obj || typeof obj !== 'object') return null;
        if (obj.session_id) return obj.session_id;

        if (Array.isArray(obj)) {
            for (const item of obj) {
                const found = deepSearchSessionId(item);
                if (found) return found;
            }
        } else {
            for (const key in obj) {
                if (key === 'session_id') return obj[key];
                const found = deepSearchSessionId(obj[key]);
                if (found) return found;
            }
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────────
    // Fallback text parser — used ONLY when n8n returns pageContent
    // instead of the structured JSON. Extracts as many fields as possible
    // from the raw document text so the UI degrades gracefully.
    // ─────────────────────────────────────────────────────────────────
    function extractPolicyFromPageContent(text) {
        if (!text) return null;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);

        // Title: first substantial line that isn't a date/URL
        const possibleTitle = lines.find(l =>
            l.length > 10 &&
            !l.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}/) &&
            !l.startsWith('http') &&
            !l.match(/^Page \d/i)
        );

        // Section boundary indexes
        const idx = (pattern) => lines.findIndex(l => pattern.test(l));
        const detailsIdx = idx(/^details$/i);
        const benefitsIdx = idx(/^benefits$/i);
        const eligIdx = idx(/^eligibility$/i);
        const appIdx = idx(/application process/i);
        const queriesIdx = idx(/queries|grievance|complaint|suggestions/i);
        const docsIdx = idx(/documents required/i);

        // Objective (text between "Details" and "Benefits")
        let objective = null;
        if (detailsIdx !== -1 && benefitsIdx !== -1) {
            objective = lines.slice(detailsIdx + 1, benefitsIdx).join(' ') || null;
        }

        // Issuing authority from "by the …" in objective
        let issuingAuthority = null;
        if (objective) {
            const m = objective.match(/by\s+the\s+([^.]+)/i);
            if (m) issuingAuthority = m[1].trim();
        }

        // Who is it for — looking for "for [group]" or specific beneficiary keywords
        let whoIsItFor = null;
        if (objective) {
            // Try specific "for [target audience]" pattern first
            const forMatch = objective.match(/for\s+([^.]+)/i);
            if (forMatch && !forMatch[1].toLowerCase().includes('loans')) {
                whoIsItFor = forMatch[1].trim();
            } else {
                // Bullet point backup
                const m = objective.match(/([^.]*(?:ward|widow|citizen|resident|applicant|operator|student|youth)[^.]*\.?)/i);
                if (m) whoIsItFor = m[1].trim();
            }
        }

        // Key benefits (lines between "Benefits" and "Eligibility")
        const keyBenefits = (benefitsIdx !== -1 && eligIdx !== -1)
            ? lines.slice(benefitsIdx + 1, eligIdx)
                .filter(l => l.length > 3 && !l.match(/^(offline|online|details|benefits)$/i))
            : [];

        // Eligibility (bullet lines or lines after Eligibility header)
        let eligibilityLines = lines
            .filter(l => /^[•\-*]/.test(l))
            .map(l => l.replace(/^[•\-*]\s*/, ''));

        if (eligibilityLines.length === 0 && eligIdx !== -1) {
            // If no bullets, take next 2 lines
            eligibilityLines = lines.slice(eligIdx + 1, eligIdx + 3).filter(l => l.length > 5);
        }

        // Required documents (lines after "Documents Required" - handles bullets and numbers)
        const docsHeaderIdx = lines.findIndex(l => /documents\s+required/i.test(l));
        let requiredDocs = [];
        if (docsHeaderIdx !== -1) {
            requiredDocs = lines
                .slice(docsHeaderIdx + 1, docsHeaderIdx + 8)
                .filter(l => /^[•\-*\d]/.test(l) || l.length > 20)
                .map(l => l.replace(/^[•\-*\d. ]+\s*/, ''))
                .filter(l => !/https|www/i.test(l));
        }

        // How to apply (numbered steps)
        const stepLines = lines
            .filter(l => /^step \d+:/i.test(l))
            .map((l, i) => `${i + 1}. ${l.replace(/^step \d+:\s*/i, '')}`);
        let howToApply = stepLines.length > 0
            ? stepLines.join('\n')
            : (appIdx !== -1
                ? lines
                    .slice(appIdx + 1, queriesIdx !== -1 ? queriesIdx : (docsHeaderIdx !== -1 ? docsHeaderIdx : undefined))
                    .filter(l => l.length > 0 && !/^offline$/i.test(l))
                    .join(' ')
                : null);

        // Important dates — look for "within X months/days" or date patterns
        let lastDate = null;
        const dateMatch = text.match(/within\s+([^.]+(?:month|day|week|announced)[^.]*\.?)/i);
        if (dateMatch) lastDate = dateMatch[1].replace(/\.$/, '').trim();
        else {
            const lastDateLine = lines.find(l => l.toLowerCase().includes('last date') || l.toLowerCase().includes('within'));
            if (lastDateLine) lastDate = lastDateLine;
        }

        // Contact info (look for helpline, phone, email)
        let contact = null;
        const contactLine = lines.find(l => /helpline|phone|email|contact/i.test(l));
        if (contactLine) contact = contactLine;
        else if (queriesIdx !== -1) {
            const contactLines = lines.slice(queriesIdx + 1, docsHeaderIdx !== -1 ? docsHeaderIdx : undefined)
                .filter(l => l.length > 10);
            contact = contactLines.join(' ') || null;
        }

        return {
            policy_name: possibleTitle || 'Policy Document',
            issuing_authority: issuingAuthority,
            objective: objective,
            who_is_it_for: whoIsItFor,
            key_benefits: keyBenefits.length > 0 ? keyBenefits : null,
            eligibility_summary: eligibilityLines.length > 0 ? eligibilityLines : null,
            required_documents: requiredDocs.length > 0 ? requiredDocs : null,
            how_to_apply: howToApply,
            important_dates: lastDate ? { start_date: null, last_date: lastDate } : null,
            issuing_authority_contact: contact
        };
    }

    function renderPolicyData(data, container) {
        container.innerHTML = '';

        if (!data) {
            container.innerHTML = '<p class="policy-text">No data received from the server.</p>';
            return;
        }

        if (typeof data === 'string') {
            try { data = JSON.parse(data); }
            catch (e) {
                container.innerHTML = `<p class="policy-text">Raw text: ${data}</p>`;
                return;
            }
        }

        // Normalize if it's an array or wrapper
        let policy = (data && !data.policy_name) ? normaliseWebhookResponse(data) : data;

        if (!policy || (typeof policy === 'object' && Object.keys(policy).length === 0)) {
            console.error('[RENDER ERROR] No structured data found after normalization. Raw:', data);
            container.innerHTML = '<p class="policy-text">No structured policy data was extracted from the document.</p>';
            return;
        }

        // Debug log (now accurate)
        console.log('Final policy object for rendering:', JSON.stringify({
            policy_name: policy.policy_name ?? '(null)',
            issuing_authority: policy.issuing_authority ?? '(null)',
            objective: policy.objective ? '✓' : '(null)',
            who_is_it_for: policy.who_is_it_for ? '✓' : '(null)',
            key_benefits: Array.isArray(policy.key_benefits) ? `✓ (${policy.key_benefits.length})` : '(null)',
            eligibility_summary: Array.isArray(policy.eligibility_summary) ? `✓ (${policy.eligibility_summary.length})` : '(null)',
            required_documents: Array.isArray(policy.required_documents) ? `✓ (${policy.required_documents.length})` : '(null)',
            how_to_apply: policy.how_to_apply ? '✓' : '(null)',
            important_dates: policy.important_dates ? '✓' : '(null)',
            issuing_authority_contact: policy.issuing_authority_contact ? '✓' : '(null)',
        }));

        // ── Hero Banner ──
        const hero = document.createElement('div');
        hero.className = 'policy-hero';

        if (policy.policy_name) {
            const title = document.createElement('h2');
            title.className = 'policy-title';
            title.textContent = policy.policy_name;
            hero.appendChild(title);
        }
        if (policy.issuing_authority) {
            const auth = document.createElement('div');
            auth.className = 'policy-authority';
            auth.textContent = policy.issuing_authority;
            hero.appendChild(auth);
        }
        container.appendChild(hero);

        // ── Sections Grid ──
        const grid = document.createElement('div');
        grid.className = 'policy-sections-grid';

        const createSection = (title, content, isList = false, wide = false) => {
            if (!content) return;

            let listContent = content;
            if (isList && typeof content === 'string') {
                listContent = content.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            }
            if (isList && (!Array.isArray(listContent) || listContent.length === 0)) return;
            if (!isList && typeof content !== 'string' && typeof content !== 'number') return;

            const section = document.createElement('div');
            section.className = wide ? 'policy-section wide' : 'policy-section';

            const heading = document.createElement('h4');
            heading.textContent = title;
            section.appendChild(heading);

            if (isList) {
                const ul = document.createElement('ul');
                ul.className = 'policy-list';
                listContent.forEach(item => {
                    const cleanItem = item.replace(/^[-•*]\s*/, '');
                    const li = document.createElement('li');
                    if (cleanItem.startsWith('**') && cleanItem.endsWith('**')) {
                        li.innerHTML = `<strong>${cleanItem.replace(/\*\*/g, '')}</strong>`;
                        li.style.listStyle = 'none';
                        li.style.paddingLeft = '0';
                        li.style.marginTop = '0.5rem';
                    } else {
                        li.textContent = cleanItem;
                    }
                    ul.appendChild(li);
                });
                section.appendChild(ul);
            } else {
                const p = document.createElement('p');
                p.className = 'policy-text';
                // Split inline numbered steps ("Step 1: …", "1. …", "2. …") into separate lines
                let displayText = String(content);
                displayText = displayText.replace(/\s*(Step \d+[:.])/gi, '\n$1');
                displayText = displayText.replace(/\s+(\d+\.\s)/g, '\n$1');
                p.textContent = displayText.trim();
                section.appendChild(p);
            }

            grid.appendChild(section);
        };

        createSection('Objective', policy.objective, false, true);
        createSection('Key Benefits', policy.key_benefits, true);
        createSection('Eligibility', policy.eligibility_summary, true);
        createSection('Required Documents', policy.required_documents, true);
        createSection('Who Is It For', policy.who_is_it_for);
        createSection('How To Apply', policy.how_to_apply);
        createSection('Contact Information', policy.issuing_authority_contact);

        if (policy.important_dates && (policy.important_dates.start_date || policy.important_dates.last_date)) {
            const dateSection = document.createElement('div');
            dateSection.className = 'policy-section';
            const dateHeading = document.createElement('h4');
            dateHeading.textContent = 'Important Dates';
            dateSection.appendChild(dateHeading);

            const datesBox = document.createElement('div');
            datesBox.className = 'policy-dates';
            if (policy.important_dates.start_date) {
                datesBox.innerHTML += `<div class="date-item"><span class="date-label">Start Date</span><span class="date-value">${policy.important_dates.start_date}</span></div>`;
            }
            if (policy.important_dates.last_date) {
                datesBox.innerHTML += `<div class="date-item"><span class="date-label">Last Date</span><span class="date-value">${policy.important_dates.last_date}</span></div>`;
            }
            dateSection.appendChild(datesBox);
            grid.appendChild(dateSection);
        }

        container.appendChild(grid);
    }

    async function handleFile(file) {
        uploadContent.classList.add('hidden');
        processingContent.classList.remove('hidden');
        fileNameDisplay.textContent = file.name;
        
        let heartbeat = null;
        try {
            // Frontend generates the Session ID
            const generatedSid = typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : `sess_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;

            currentSessionId = generatedSid;
            console.log('✨ Generated Frontend Session ID:', currentSessionId);

            const formData = new FormData();
            formData.append('file', file, file.name); // Using 'file' as expected by n8n workflow
            formData.append('session_id', currentSessionId);

            const proxyUploadUrl = `/proxy?target=process_doc`;
            
            // Continuous heartbeat for UX
            let dotCount = 0;
            heartbeat = setInterval(() => {
                dotCount = (dotCount + 1) % 4;
                statusText.textContent = "Processing" + ".".repeat(dotCount) + " Please wait";
            }, 1000);

            console.log('🚀 Sending request to proxy:', proxyUploadUrl);
            const uploadReq = fetch(proxyUploadUrl, {
                method: 'POST',
                body: formData
            });

            console.log('🕒 Fetch initiated, waiting for response...');

            // Remove fixed UX wait to ensure data loads as soon as received
            const response = await uploadReq;
            clearInterval(heartbeat);

            console.log('✨ Response received from n8n. Status:', response.status);
            console.log('📋 Content-Type:', response.headers.get('Content-Type'));
            console.log('✨ Response received from n8n. Length:', response.headers.get('Content-Length') || 'Unknown');
            
            const responseText = await response.text();
            console.log("✨ Response received from n8n. Length:", responseText.length);
            console.log("📄 Raw Response Content:", responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""));

            let resultData;
            try {
                // Try to find a JSON block in the response text if it exists
                const jsonMatch = responseText.match(/(\{|\[)[\s\S]*(\}|\])/);
                const stringToParse = jsonMatch ? jsonMatch[0] : responseText;
                resultData = JSON.parse(stringToParse);
            } catch (err) {
                console.warn("JSON Parsing Error, falling back to raw object:", err);
                resultData = { raw: responseText };
            }

            // Normalise the data into a single policy object
            const policyEntry = normaliseWebhookResponse(resultData) || resultData;

            // ENSURE the processing screen is hidden before rendering
            processingContent.classList.add('hidden');
            successContent.classList.remove('hidden');

            renderPolicyData(policyEntry, policyResultContainer);

            // Show results almost immediately
            setTimeout(() => {
                successContent.classList.add('hidden');
                resultContent.classList.remove('hidden');
                mainContainer.classList.add('result-active');
                document.body.classList.add('result-active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);

        } catch (error) {
            console.error('Upload Error:', error);
            processingContent.classList.add('hidden'); // Fail-safe: hide on error
            statusText.textContent = "Upload Failed";
            statusText.style.color = "#ef4444";
            fileNameDisplay.textContent = "Please try again. " + error.message;

            setTimeout(() => {
                resetFlow();
                statusText.style.color = "";
            }, 5000);
        } finally {
            clearInterval(heartbeat);
        }
    }

    // ─────────────────────────────────────────────────────────
    // Eligibility Chat Logic
    // ─────────────────────────────────────────────────────────
    const ELIGIBILITY_WEBHOOK = '/proxy?target=eligibility';
    const OTHER_POLICIES_WEBHOOK = '/proxy?target=other_policies';

    const chatOverlay = document.getElementById('chat-overlay');
    const chatMessages = document.getElementById('chat-messages');
    const chatTyping = document.getElementById('chat-typing');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatStatus = document.getElementById('chat-status');
    const eligibilityBtn = document.getElementById('eligibility-btn');
    const chatInputBar = document.getElementById('chat-input-bar');

    let chatActive = false;

    function appendMessage(text, sender) {
        const wrapper = document.createElement('div');
        wrapper.className = `chat-message ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'msg-avatar';
        avatar.textContent = sender === 'bot' ? '✦' : 'U';

        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.textContent = text;

        wrapper.appendChild(avatar);
        wrapper.appendChild(bubble);
        chatMessages.appendChild(wrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function setTyping(visible) {
        chatTyping.classList.toggle('hidden', !visible);
        if (visible) chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function setInputEnabled(enabled) {
        chatInput.disabled = !enabled;
        chatSendBtn.disabled = !enabled;
        if (enabled) chatInput.focus();
    }

    function extractQuestion(data) {
        if (!data) return null;
        if (typeof data === 'string' && data.trim().length > 0) return data.trim();
        if (Array.isArray(data) && data.length > 0) {
            const item = data[0];
            if (typeof item === 'string') return item.trim();
            if (item && typeof item === 'object') {
                if (item.status === 'eligible' || item.status === 'not_eligible' || item.status === 'partially_eligible' ||
                    item.status === 'complete' || item.status === 'done') return null;

                return (item.question ?? item.message ?? item.text ??
                    item.next_question ?? item.output ?? item.response ??
                    Object.values(item).find(v => typeof v === 'string' && v.trim().length > 0) ?? null);
            }
        }
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            if (data.done === true || data.finished === true ||
                data.status === 'complete' || data.status === 'done' ||
                data.status === 'eligible' || data.status === 'not_eligible' || data.status === 'partially_eligible') return null;
            return (data.question ?? data.message ?? data.text ??
                data.next_question ?? data.output ?? data.response ??
                Object.values(data).find(v => typeof v === 'string' && v.trim().length > 0) ?? null);
        }
        return null;
    }

    // New Helper: Exhaustive search for eligibility status in any object tree
    function deepSearchEligibilityResult(obj) {
        if (!obj || typeof obj !== 'object') return null;

        // Check if current level is the result
        const s = obj.status?.toLowerCase();
        if (s === 'eligible' || s === 'not_eligible' || s === 'partially_eligible') {
            return obj;
        }

        if (Array.isArray(obj)) {
            for (const item of obj) {
                const found = deepSearchEligibilityResult(item);
                if (found) return found;
            }
        } else {
            // Prioritise keys that look like content
            const priorityKeys = ['output', 'message', 'data', 'json', 'result'];
            const sortedKeys = Object.keys(obj).sort((a, b) => priorityKeys.indexOf(b) - priorityKeys.indexOf(a));

            for (const key of sortedKeys) {
                const val = obj[key];
                
                // Handle Google AI Node nested in eligibility result
                if (key === 'content' && val?.parts?.[0]?.text) {
                    const aiPayload = val.parts[0].text;
                    const jsonMatch = aiPayload.match(/(\{|\[)[\s\S]*(\}|\])/);
                    if (jsonMatch) {
                        try {
                            const parsed = JSON.parse(jsonMatch[0]);
                            const found = deepSearchEligibilityResult(parsed);
                            if (found) return found;
                        } catch (e) { }
                    }
                }

                if (typeof val === 'string' && (val.trim().startsWith('{') || val.trim().startsWith('['))) {
                    try {
                        const parsed = JSON.parse(val.replace(/```json\n?|```/g, '').trim());
                        const found = deepSearchEligibilityResult(parsed);
                        if (found) return found;
                    } catch (e) { }
                }
                if (val && typeof val === 'object') {
                    const found = deepSearchEligibilityResult(val);
                    if (found) return found;
                }
            }
        }
        return null;
    }

    async function processAgentResponse(responseText) {
        if (!responseText || ['', '{}', '[]'].includes(responseText.trim())) {
            endChat(); return;
        }

        let data = null;
        let parsed = null;

        // Try direct parse first
        try {
            // Find JSON block if it exists (robust extraction)
            const jsonMatch = responseText.match(/(\{|\[)[\s\S]*(\}|\])/);
            const stringToParse = jsonMatch ? jsonMatch[0] : responseText;
            parsed = JSON.parse(stringToParse.replace(/```json\n?|```/g, '').trim());
        } catch (e) {
            console.warn("[CHAT] JSON Parse failed, trying blocks...", e);
            const blocks = responseText.match(/\{[\s\S]*\}|\[[\s\S]*\]/g);
            if (blocks) {
                for (const b of blocks) {
                    try {
                        parsed = JSON.parse(b);
                        const found = deepSearchEligibilityResult(parsed);
                        if (found) { data = found; break; }
                    } catch (err) { }
                }
            }
        }

        // If parsed but not deep-searched yet
        if (parsed && !data) {
            data = deepSearchEligibilityResult(parsed) || parsed;
        }

        // Final check: is it an eligibility result?
        const isEligibilityResult = data && typeof data === 'object' && !Array.isArray(data) &&
            (data.status === 'eligible' || data.status === 'not_eligible' || data.status === 'partially_eligible' || 'other_matching_schemes' in data);

        if (isEligibilityResult) {
            renderEligibilityResult(data);
            endChat();
            return;
        }

        // Otherwise handle as a normal message/question
        const nextQuestion = extractQuestion(data || responseText);
        if (!nextQuestion || nextQuestion.trim() === '') {
            endChat();
        } else {
            chatStatus.textContent = 'AI Agent • Online';
            appendMessage(nextQuestion.trim(), 'bot');
            setInputEnabled(true);
        }
    }

    async function openChat() {
        chatMessages.innerHTML = '';
        chatActive = true;
        chatStatus.textContent = 'AI Agent • Connecting...';
        setInputEnabled(false);
        setTyping(true);
        if (chatInputBar) chatInputBar.classList.remove('hidden');
        chatOverlay.classList.remove('hidden');

        try {
            const response = await fetch(ELIGIBILITY_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: currentSessionId })
            });

            setTyping(false);
            if (!response.ok) throw new Error(`Webhook error: ${response.status}`);

            const responseText = await response.text();
            await processAgentResponse(responseText);

        } catch (err) {
            console.error('Eligibility init error:', err);
            setTyping(false);
            chatStatus.textContent = 'AI Agent • Error';
            appendMessage('Sorry, could not connect to the agent. Please try again.', 'bot');
            setInputEnabled(true);
        }
    }

    function closeChat() {
        chatOverlay.classList.add('hidden');
        chatMessages.innerHTML = '';
        chatActive = false;
        setInputEnabled(false);
    }

    async function sendChatAnswer(answer) {
        if (!answer.trim() || !chatActive) return;

        appendMessage(answer, 'user');
        setInputEnabled(false);
        setTyping(true);
        chatStatus.textContent = 'AI Agent • Thinking...';

        try {
            const response = await fetch(ELIGIBILITY_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: currentSessionId, answer: answer.trim() })
            });

            setTyping(false);

            if (response.status === 204 ||
                (response.status === 200 && response.headers.get('content-length') === '0')) {
                endChat(); return;
            }
            if (!response.ok) throw new Error(`Webhook error: ${response.status}`);

            const responseText = await response.text();
            await processAgentResponse(responseText);

        } catch (err) {
            console.error('Eligibility chat error:', err);
            setTyping(false);
            chatStatus.textContent = 'AI Agent • Error';
            appendMessage('Sorry, something went wrong connecting to the agent. Please try again.', 'bot');
            setInputEnabled(true);
        }
    }

    function renderEligibilityResult(data) {
        const card = document.createElement('div');
        card.className = 'eligibility-result-card';

        if (data.status) {
            const status = data.status;
            const isEligible = status === 'eligible';
            const isPartial = status === 'partially_eligible';

            const badge = document.createElement('div');
            badge.className = `eligibility-badge ${isEligible ? 'eligible' : (isPartial ? 'partially-eligible' : 'not-eligible')}`;
            badge.textContent = isEligible ? '✓ Eligible' : (isPartial ? '⚠ Partially Eligible' : '✗ Not Eligible');
            card.appendChild(badge);

            if (data.summary) {
                const summary = document.createElement('p');
                summary.className = 'eligibility-summary';
                summary.textContent = data.summary;
                card.appendChild(summary);
            }

            if (data.matched_criteria?.length > 0) {
                const section = document.createElement('div');
                section.className = 'eligibility-section';
                section.innerHTML = '<span class="criteria-label met">✓ Criteria Met</span>';
                const ul = document.createElement('ul');
                data.matched_criteria.forEach(c => {
                    const li = document.createElement('li'); li.textContent = c; ul.appendChild(li);
                });
                section.appendChild(ul);
                card.appendChild(section);
            }

            if (data.failed_criteria?.length > 0) {
                const section = document.createElement('div');
                section.className = 'eligibility-section';
                section.innerHTML = '<span class="criteria-label missed">✗ Criteria Not Met</span>';
                const ul = document.createElement('ul');
                data.failed_criteria.forEach(c => {
                    const li = document.createElement('li'); li.textContent = c; ul.appendChild(li);
                });
                section.appendChild(ul);
                card.appendChild(section);
            }

            if (data.unverified_criteria?.length > 0) {
                const section = document.createElement('div');
                section.className = 'eligibility-section';
                section.innerHTML = '<span class="criteria-label unverified">? Pending Verification</span>';
                const ul = document.createElement('ul');
                data.unverified_criteria.forEach(c => {
                    const li = document.createElement('li'); li.textContent = c; ul.appendChild(li);
                });
                section.appendChild(ul);
                card.appendChild(section);
            }
        }

        if (data.other_matching_schemes?.length > 0) {
            const section = document.createElement('div');
            section.className = 'eligibility-section';
            section.innerHTML = '<span class="criteria-label schemes">💡 You May Also Qualify For</span>';
            const ul = document.createElement('ul');
            data.other_matching_schemes.forEach(s => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${s.scheme_name}</strong>${s.why_relevant ? `<br><span class='scheme-reason'>${s.why_relevant}</span>` : ''}`;
                ul.appendChild(li);
            });
            section.appendChild(ul);
            card.appendChild(section);
        }

        const msgContainer = document.createElement('div');
        msgContainer.className = 'chat-message bot';
        msgContainer.innerHTML = `
            <div class="msg-avatar">✦</div>
            <div class="msg-content"></div>
        `;
        msgContainer.querySelector('.msg-content').appendChild(card);

        chatMessages.appendChild(msgContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function endChat() {
        chatActive = false;
        chatStatus.textContent = 'AI Agent • Session Complete';
        if (chatInputBar) chatInputBar.classList.add('hidden');
        if (chatTyping) chatTyping.classList.add('hidden');

        // Check if notice already exists to avoid duplicates
        if (document.getElementById('btn-other-policies')) return;

        const doneEl = document.createElement('div');
        doneEl.className = 'chat-completion-notice';
        doneEl.innerHTML = `
            <div class="completion-divider"></div>
            <p class="completion-text">✓ Verification process complete. Thank you!</p>
            <div class="chat-completion-actions">
                <button class="btn-other-policies" id="btn-other-policies">
                    View other Recommended Policies
                </button>
            </div>
        `;
        chatMessages.appendChild(doneEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        setInputEnabled(false);

        // Add event listener to the newly created button
        const otherBtn = doneEl.querySelector('#btn-other-policies');
        if (otherBtn) otherBtn.addEventListener('click', fetchOtherPolicies);
    }

    async function fetchOtherPolicies() {
        const otherBtn = document.getElementById('btn-other-policies');
        if (otherBtn) {
            otherBtn.disabled = true;
            otherBtn.textContent = 'Finding policies...';
        }

        try {
            const response = await fetch(OTHER_POLICIES_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: currentSessionId })
            });

            if (!response.ok) throw new Error('Discovery error');
            const responseText = await response.text();

            let data;
            try {
                const cleanJson = responseText.replace(/```json\n?|```/g, '').trim();
                const jsonMatch = cleanJson.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                data = JSON.parse(jsonMatch ? jsonMatch[0] : cleanJson);

                // Deep search/unmask if it's nested
                if (data && typeof data === 'object') {
                    const found = deepSearchEligibilityResult(data);
                    if (found) data = found;
                }
            } catch (e) {
                data = responseText;
            }

            const resultMsg = document.createElement('div');
            resultMsg.className = 'chat-message bot discovery-result';

            let contentHtml = '';
            if (Array.isArray(data) || (data && typeof data === 'object')) {
                const items = Array.isArray(data) ? data : (data.policies || data.schemes || [data]);

                // Filter for items that actually have content (not just the generic placeholders)
                const validItems = items.filter(item => {
                    const name = item.name || item.scheme_name || item.title;
                    return name && name !== 'Relevant Scheme';
                });

                if (validItems.length > 0) {
                    discoveredPolicies = validItems; // Store for modal access
                    contentHtml = `
                        <div class="discovery-cards-container">
                            ${validItems.map((item, idx) => `
                                <div class="discovery-card" onclick="window.showSchemeDetails(${idx})">
                                    <div class="discovery-card-icon">✦</div>
                                    <div class="discovery-card-body">
                                        <div class="discovery-card-name">${item.name || item.scheme_name || item.title}</div>
                                        <div class="discovery-card-desc">${item.description || item.summary || item.details || 'Found based on your profile.'}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                } else {
                    contentHtml = `
                        <div class="chat-notice-simple">
                            <p>No additional eligible policies found for your profile at this time.</p>
                        </div>
                    `;
                }
            } else {
                contentHtml = `
                    <p>${responseText.length > 800 ? responseText.slice(0, 800) + '...' : responseText}</p>
                `;
                contentHtml += `
                <div style="margin-top: 1rem; font-size: 0.8rem; color: hsl(var(--primary)); opacity: 0.8">
                    Please check your dashboard for full enrollment details.
                </div>
            `;
            }

            resultMsg.innerHTML = `
                <div class="msg-avatar">✦</div>
                <div class="msg-content">${contentHtml}</div>
            `;

            chatMessages.appendChild(resultMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            if (otherBtn) {
                otherBtn.textContent = 'Discovery Complete';
                otherBtn.style.opacity = '0.5';
            }

        } catch (err) {
            console.error('Other policies error:', err);
            appendMessage('Unable to fetch other policies at this time.', 'bot');
            if (otherBtn) {
                otherBtn.disabled = false;
                otherBtn.textContent = 'View other Eligible Policies';
            }
        }
    }

    // ── Scheme Detail Modal Logic ──
    const schemeOverlay = document.getElementById('scheme-overlay');
    const schemeContent = document.getElementById('scheme-detail-content');
    const schemeTitle = document.getElementById('scheme-detail-title');
    const schemeCloseBtn = document.getElementById('scheme-close-btn');
    const shareBtn = document.getElementById('share-scheme-btn');

    window.showSchemeDetails = function (index) {
        const policy = discoveredPolicies[index];
        if (!policy) return;

        schemeTitle.textContent = policy.name || policy.scheme_name || policy.title || 'Scheme Details';

        // Define fields to show
        const fields = [
            { label: 'Objective', key: ['objective', 'description', 'summary'] },
            { label: 'Who is it for', key: ['who_is_it_for', 'eligibility', 'target_group'] },
            { label: 'Key Benefits', key: ['key_benefits', 'benefits', 'amount'] },
            { label: 'How to Apply', key: ['how_to_apply', 'application_process', 'process'] },
            { label: 'Important Dates', key: ['important_dates', 'dates', 'last_date'] }
        ];

        let html = '';
        fields.forEach(f => {
            const val = f.key.map(k => policy[k]).find(v => !!v);
            if (val) {
                html += `
                    <div class="detail-section">
                        <div class="detail-label">${f.label}</div>
                        <div class="detail-value">${Array.isArray(val) ? val.join('<br>') : val}</div>
                    </div>
                `;
            }
        });

        schemeContent.innerHTML = html || '<p class="detail-value">Detailed information is available on the official portal.</p>';
        schemeOverlay.classList.remove('hidden');

        // Store current index for sharing
        shareBtn.setAttribute('data-index', index);
    };

    function closeSchemeModal() {
        schemeOverlay.classList.add('hidden');
    }

    if (schemeCloseBtn) schemeCloseBtn.addEventListener('click', closeSchemeModal);
    schemeOverlay.addEventListener('click', (e) => { if (e.target === schemeOverlay) closeSchemeModal(); });

    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const idx = shareBtn.getAttribute('data-index');
            const policy = discoveredPolicies[idx];
            if (!policy) return;

            const name = policy.name || policy.scheme_name || 'Scheme';
            const text = `Check out this policy: ${name}\n\nDetails found using Unfazed Policy Navigator.`;

            // Try WhatsApp share
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank');

            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                const originalText = shareBtn.innerHTML;
                shareBtn.textContent = '✓ Link Copied!';
                setTimeout(() => { shareBtn.innerHTML = originalText; }, 2000);
            });
        });
    }

    if (eligibilityBtn) eligibilityBtn.addEventListener('click', openChat);
    if (chatCloseBtn) chatCloseBtn.addEventListener('click', closeChat);

    chatOverlay.addEventListener('click', (e) => { if (e.target === chatOverlay) closeChat(); });

    chatSendBtn.addEventListener('click', () => {
        const val = chatInput.value.trim();
        if (val) { chatInput.value = ''; sendChatAnswer(val); }
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const val = chatInput.value.trim();
            if (val) { chatInput.value = ''; sendChatAnswer(val); }
        }
    });
});