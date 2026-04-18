// ============================================
// MESSAGE REACTIONS SYSTEM
// ============================================

// აქ შეგიძლია დაამატო შენი საყვარელი რეაქციები
const AVAILABLE_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '💯', '🤣', '🥺', '😍', '🤔'];

// ცვლადები
let currentReactionMessageId = null;
let currentReactionPicker = null;

// ============================================
// ცხრილის შექმნა Supabase-ში (გაუშვი SQL Editor-ში)
// ============================================
/*
CREATE TABLE IF NOT EXISTS message_reactions (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction)
);

CREATE INDEX IF NOT EXISTS idx_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON message_reactions(user_id);

-- Enable Realtime for reactions
ALTER TABLE message_reactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
*/

// ============================================
// რეაქციის დამატება/წაშლა
// ============================================
async function toggleReaction(messageId, reaction) {
    if (!ME || !ME.id) {
        toast('❓ გაიარე ავტორიზაცია');
        return;
    }

    try {
        // შეამოწმე აქვს თუ არა უკვე ეს რეაქცია
        const { data: existing } = await sb
            .from('message_reactions')
            .select('id')
            .eq('message_id', messageId)
            .eq('user_id', ME.id)
            .eq('reaction', reaction)
            .single();

        if (existing) {
            // წაშალე რეაქცია
            const { error } = await sb
                .from('message_reactions')
                .delete()
                .eq('id', existing.id);
            
            if (error) throw error;
            console.log(`🗑 Reaction removed: ${reaction}`);
        } else {
            // დაამატე რეაქცია
            const { error } = await sb
                .from('message_reactions')
                .insert({
                    message_id: messageId,
                    user_id: ME.id,
                    reaction: reaction
                });
            
            if (error) throw error;
            console.log(`✅ Reaction added: ${reaction}`);
        }

        // განაახლე UI
        await updateMessageReactions(messageId);
        
    } catch (error) {
        console.error('Reaction error:', error);
        toast('❌ შეცდომა: ' + error.message);
    }
}

// ============================================
// რეაქციების ჩატვირთვა კონკრეტული მესიჯისთვის
// ============================================
async function loadMessageReactions(messageId) {
    const { data, error } = await sb
        .from('message_reactions')
        .select('reaction, user_id, profiles!inner(username)')
        .eq('message_id', messageId);

    if (error) {
        console.error('Load reactions error:', error);
        return [];
    }

    // დააჯგუფე რეაქციები
    const grouped = {};
    data.forEach(item => {
        if (!grouped[item.reaction]) {
            grouped[item.reaction] = {
                count: 0,
                users: []
            };
        }
        grouped[item.reaction].count++;
        grouped[item.reaction].users.push(item.user_id);
    });

    return grouped;
}

// ============================================
// რეაქციების UI-ს განახლება
// ============================================
async function updateMessageReactions(messageId) {
    const reactionsContainer = document.getElementById(`reactions-${messageId}`);
    if (!reactionsContainer) return;

    const reactions = await loadMessageReactions(messageId);
    
    if (Object.keys(reactions).length === 0) {
        reactionsContainer.innerHTML = '';
        return;
    }

    // შექმენი რეაქციების ღილაკები
    const buttonsHtml = Object.entries(reactions).map(([emoji, data]) => {
        const hasUserReacted = data.users.includes(ME?.id);
        return `
            <button class="reaction-btn ${hasUserReacted ? 'active' : ''}" 
                    onclick="toggleReaction('${messageId}', '${emoji}')"
                    onmouseenter="showReactionTooltip(event, '${data.users.map(u => allUsers.find(user => user.id === u)?.username || '?').join(', ')}')"
                    onmouseleave="hideReactionTooltip()">
                <span class="reaction-emoji">${emoji}</span>
                <span class="reaction-count">${data.count}</span>
            </button>
        `;
    }).join('');

    reactionsContainer.innerHTML = buttonsHtml;
}

// ============================================
// რეაქციის ამომრჩევი (picker)
// ============================================
function showReactionPicker(messageId, event) {
    // დახურე წინა პიკერი
    if (currentReactionPicker) {
        currentReactionPicker.remove();
        currentReactionPicker = null;
    }

    currentReactionMessageId = messageId;

    const picker = document.createElement('div');
    picker.className = 'reaction-picker';
    picker.id = `picker-${messageId}`;

    // დაამატე ყველა რეაქცია
    AVAILABLE_REACTIONS.forEach(emoji => {
        const btn = document.createElement('button');
        btn.className = 'reaction-option';
        btn.textContent = emoji;
        btn.onclick = (e) => {
            e.stopPropagation();
            toggleReaction(messageId, emoji);
            hideReactionPicker();
        };
        picker.appendChild(btn);
    });

    // პოზიციონირება
    const target = event.target.closest('.msg-bubble') || event.target;
    const rect = target.getBoundingClientRect();
    picker.style.position = 'fixed';
    picker.style.bottom = window.innerHeight - rect.top + 10 + 'px';
    picker.style.left = rect.left + 'px';
    
    document.body.appendChild(picker);
    currentReactionPicker = picker;

    // დახურე როცა გარეთ დააჭერენ
    setTimeout(() => {
        document.addEventListener('click', function closePicker(e) {
            if (!picker.contains(e.target)) {
                hideReactionPicker();
                document.removeEventListener('click', closePicker);
            }
        });
    }, 100);
}

function hideReactionPicker() {
    if (currentReactionPicker) {
        currentReactionPicker.remove();
        currentReactionPicker = null;
    }
    currentReactionMessageId = null;
}

// ============================================
// Tooltip - ვინ დარეაქცია
// ============================================
let currentTooltip = null;

function showReactionTooltip(event, users) {
    if (currentTooltip) hideReactionTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'reaction-tooltip';
    tooltip.textContent = users;
    
    const btn = event.target.closest('.reaction-btn');
    if (btn) {
        const rect = btn.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.bottom = window.innerHeight - rect.top + 5 + 'px';
        tooltip.style.left = rect.left + rect.width/2 + 'px';
        document.body.appendChild(tooltip);
        currentTooltip = tooltip;
    }
}

function hideReactionTooltip() {
    if (currentTooltip) {
        currentTooltip.remove();
        currentTooltip = null;
    }
}

// ============================================
// მოდიფიცირებული appendMsg ფუნქცია (რეაქციების მხარდაჭერით)
// ============================================
// ეს ფუნქცია ჩაანაცვლებს შენს არსებულ appendMsg-ს
async function appendMsgWithReactions(m) {
    const isMe = (m.user_id === ME?.id);
    const myRole = MYPROF?.role;
    const authorRole = m.profiles?.role;
    const canDel = myRole === 'founder' || (myRole === 'admin' && authorRole !== 'founder') || isMe;
    const t = new Date(m.created_at).toLocaleTimeString('ka-GE', {hour:'2-digit', minute:'2-digit'});
    const role = m.profiles?.role;
    const rbadge = role && role !== 'member' ? `<span class="role-badge ${rbClass(role)}">${rLabel(role)}</span>` : '';
    const avHtml = m.profiles?.avatar_url ? `<img src="${m.profiles.avatar_url}" style="width:100%;height:100%;object-fit:cover">` : (m.profiles?.emotion || '😊');
    const mineLabel = isMe ? '<span style="font-size:9px;color:var(--indigo2);font-weight:600">შენ</span>' : '';
    
    const row = document.createElement('div');
    row.className = 'msg-row';
    row.id = 'msg' + m.id;
    
    row.innerHTML = `
        <div class="avatar" style="cursor:pointer" onclick="openProfile('${m.user_id}')">${avHtml}</div>
        <div class="msg-content">
            <div class="msg-meta">
                <span class="msg-nick" onclick="openProfile('${m.user_id}')">${esc(m.profiles?.username||'?')}</span>
                ${rbadge}${mineLabel}
                <span class="msg-time">${t}</span>
            </div>
            <div class="msg-bubble${isMe?' mine':''}" style="position:relative">
                ${renderContent(m.content)}
                ${canDel?`<button class="msg-del" onclick="delMsg('${m.id}')">🗑</button>`:''}
                <button class="reaction-add-btn" onclick="showReactionPicker('${m.id}', event)" 
                        style="position:absolute; bottom:-8px; right:8px; background:var(--indigo-f); border:1px solid var(--border); border-radius:20px; padding:2px 8px; font-size:12px; cursor:pointer; opacity:0; transition:opacity 0.2s">
                    😊
                </button>
            </div>
            <div class="msg-reactions-container ${isMe ? 'mine' : ''}">
                <div class="msg-reactions" id="reactions-${m.id}"></div>
            </div>
        </div>
    `;
    
    document.getElementById('messages').appendChild(row);
    
    // აჩვენე რეაქციის ღილაკი hover-ზე
    const bubble = row.querySelector('.msg-bubble');
    const reactBtn = bubble.querySelector('.reaction-add-btn');
    bubble.addEventListener('mouseenter', () => reactBtn.style.opacity = '1');
    bubble.addEventListener('mouseleave', () => reactBtn.style.opacity = '0');
    
    // ჩატვირთე არსებული რეაქციები
    await updateMessageReactions(m.id);
}

// ============================================
// რეალურ დროში რეაქციების მოსმენა
// ============================================
function subscribeToReactions() {
    sb.channel('reactions-channel')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'message_reactions'
        }, async (payload) => {
            // განაახლე მესიჯის რეაქციები
            if (payload.new?.message_id) {
                await updateMessageReactions(payload.new.message_id);
            }
            if (payload.old?.message_id) {
                await updateMessageReactions(payload.old.message_id);
            }
        })
        .subscribe();
}

// ============================================
// ინიციალიზაცია
// ============================================
function initMessageReactions() {
    console.log('✅ Message Reactions system initialized');
    subscribeToReactions();
    
    // ჩაანაცვლე ორიგინალი appendMsg
    if (typeof window.originalAppendMsg === 'undefined') {
        window.originalAppendMsg = window.appendMsg;
        window.appendMsg = appendMsgWithReactions;
    }
}

// გამოიძახე init-ის შემდეგ
// initMessageReactions();
