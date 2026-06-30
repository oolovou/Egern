// ProtectionStats.js
// 统计 Egern 配置中所有规则（包括 rule_set 和直接规则）的策略分布

function getRuleStats() {
    let rules = [];
    // 尝试从 $config 获取规则列表（Egern 常见 API）
    if (typeof $config !== 'undefined' && $config.rules) {
        rules = $config.rules;
    } else {
        // 备用：如果 $config 不可用，尝试 $rules（部分版本）
        if (typeof $rules !== 'undefined' && Array.isArray($rules)) {
            rules = $rules;
        } else {
            // 若均不可用，返回错误信息
            return null;
        }
    }

    let total = rules.length;
    let reject = 0, rejectDrop = 0, rejectNoDrop = 0;
    let direct = 0, proxy = 0, other = 0;

    rules.forEach(rule => {
        let policy = (rule.policy || '').toUpperCase();
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

// 执行统计
let stats = getRuleStats();
if (stats === null) {
    $done({
        content: '⚠️ 无法获取规则列表',
        icon: 'xmark.circle'
    });
} else {
    let protection = stats.reject + stats.rejectDrop + stats.rejectNoDrop;
    let content = `🛡️ 防护规则: ${protection}\n` +
                  `📊 总计规则: ${stats.total}\n` +
                  `🚫 REJECT: ${stats.reject}\n` +
                  `🗑️ REJECT-DROP: ${stats.rejectDrop}\n` +
                  `⛔ REJECT-NO-DROP: ${stats.rejectNoDrop}\n` +
                  `➡️ DIRECT: ${stats.direct}\n` +
                  `🌐 PROXY: ${stats.proxy}\n` +
                  `📦 其他: ${stats.other}`;

    $done({
        content: content,
        icon: 'shield.fill' // 可选 SF Symbol 名称
    });
}