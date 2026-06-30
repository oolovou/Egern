/**
 * Egern widget: Rule Protection Statistics
 * Counts rules with REJECT/REJECT-DROP/REJECT-NO-DROP policies.
 *
 * Optional env:
 *   SHOW_DETAILS=true  - show full breakdown in widget (default false)
 */

const RULE_KEY = 'egern.rule-stats'; // not used for storage, just placeholder

function countRules(rules) {
    let total = 0;
    let reject = 0, rejectDrop = 0, rejectNoDrop = 0;
    let direct = 0, proxy = 0, other = 0;

    (rules || []).forEach(rule => {
        total++;
        const policy = (rule.policy || '').toUpperCase();
        if (policy.startsWith('REJECT-DROP')) {
            rejectDrop++;
        } else if (policy.startsWith('REJECT-NO-DROP')) {
            rejectNoDrop++;
        } else if (policy.startsWith('REJECT')) {
            reject++;
        } else if (policy === 'DIRECT') {
            direct++;
        } else if (policy === 'PROXY' || policy.includes('PROXY')) {
            proxy++;
        } else {
            other++;
        }
    });

    return { total, reject, rejectDrop, rejectNoDrop, direct, proxy, other };
}

function formatContent(stats, showDetails) {
    const protection = stats.reject + stats.rejectDrop + stats.rejectNoDrop;
    let lines = [
        `🛡️ 防护: ${protection}`,
        `📊 总计: ${stats.total}`
    ];
    if (showDetails) {
        lines.push(
            `🚫 REJECT: ${stats.reject}`,
            `🗑️ DROP: ${stats.rejectDrop}`,
            `⛔ NO-DROP: ${stats.rejectNoDrop}`,
            `➡️ DIRECT: ${stats.direct}`,
            `🌐 PROXY: ${stats.proxy}`,
            `📦 其他: ${stats.other}`
        );
    }
    return lines.join('\n');
}

export default async function(ctx) {
    try {
        let rules = [];
        // Try multiple ways to get the rule list
        if (ctx.rules && Array.isArray(ctx.rules)) {
            rules = ctx.rules;
        } else if (ctx.config && ctx.config.rules && Array.isArray(ctx.config.rules)) {
            rules = ctx.config.rules;
        } else if (typeof $config !== 'undefined' && $config.rules && Array.isArray($config.rules)) {
            rules = $config.rules;
        } else if (typeof $rules !== 'undefined' && Array.isArray($rules)) {
            rules = $rules;
        } else {
            // Fallback: try to get from global `rules` (if any)
            if (typeof rules !== 'undefined' && Array.isArray(rules)) {
                rules = rules;
            }
        }

        if (!rules || rules.length === 0) {
            return {
                content: '⚠️ 未找到规则列表（可能为空）',
                icon: 'exclamationmark.triangle'
            };
        }

        const stats = countRules(rules);
        const showDetails = ctx.env?.SHOW_DETAILS === 'true';
        const content = formatContent(stats, showDetails);

        return {
            content: content,
            icon: 'shield.fill'
        };
    } catch (e) {
        return {
            content: '❌ 错误: ' + e.message,
            icon: 'xmark.octagon'
        };
    }
}