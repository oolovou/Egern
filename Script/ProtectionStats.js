// ProtectionStats.js
// 统计 Egern 配置中所有规则的策略分布
// 注意：不要使用 export/import，保持普通脚本

(function() {
    try {
        var rules = [];
        // 尝试从 $config 获取规则列表（Egern 常见 API）
        if (typeof $config !== 'undefined' && $config.rules && Array.isArray($config.rules)) {
            rules = $config.rules;
        } else if (typeof $rules !== 'undefined' && Array.isArray($rules)) {
            rules = $rules;
        } else {
            $done({
                content: '⚠️ 无法获取规则列表\n请检查脚本环境',
                icon: 'xmark.circle'
            });
            return;
        }

        if (rules.length === 0) {
            $done({
                content: '⚠️ 规则列表为空\n可能尚未加载完成',
                icon: 'exclamationmark.triangle'
            });
            return;
        }

        var total = rules.length;
        var reject = 0, rejectDrop = 0, rejectNoDrop = 0;
        var direct = 0, proxy = 0, other = 0;

        rules.forEach(function(rule) {
            var policy = (rule.policy || '').toUpperCase();
            if (policy.startsWith('REJECT-DROP')) {
                rejectDrop++;
            } else if (policy.startsWith('REJECT-NO-DROP')) {
                rejectNoDrop++;
            } else if (policy.startsWith('REJECT')) {
                reject++;
            } else if (policy === 'DIRECT') {
                direct++;
            } else if (policy === 'PROXY' || policy.indexOf('PROXY') !== -1) {
                proxy++;
            } else {
                other++;
            }
        });

        var protection = reject + rejectDrop + rejectNoDrop;
        var content = '🛡️ 防护规则: ' + protection + '\n' +
                      '📊 总计规则: ' + total + '\n' +
                      '🚫 REJECT: ' + reject + '\n' +
                      '🗑️ REJECT-DROP: ' + rejectDrop + '\n' +
                      '⛔ REJECT-NO-DROP: ' + rejectNoDrop + '\n' +
                      '➡️ DIRECT: ' + direct + '\n' +
                      '🌐 PROXY: ' + proxy + '\n' +
                      '📦 其他: ' + other;

        $done({
            content: content,
            icon: 'shield.fill'
        });
    } catch (e) {
        $done({
            content: '❌ 脚本错误: ' + e.message,
            icon: 'xmark.octagon'
        });
    }
})();