const http = require('http');
const url = require('url');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const query = parsedUrl.query;

  const num1 = parseInt(query.num1);
  const num2 = parseInt(query.num2);
  let resultText = '数字を入力してください。';
  let historyHtml = '履歴はありません。';

  // 1. 計算と保存の処理
  if (!isNaN(num1) && !isNaN(num2)) {
    const sum = num1 + num2;
    const logMessage = `${new Date().toLocaleString()}: ${num1} + ${num2} = ${sum}\n`;
    
    // 同期的に追記（今回は単純化のため、書き込み完了を待つ appendFileSync を使用）
    fs.appendFileSync('history.txt', logMessage);
    resultText = `計算結果：${sum} （保存しました）`;
  }

  // 2. 【ここが新機能！】ファイルの読み込みと履歴の準備
  if (fs.existsSync('history.txt')) {
    // ファイルを読み込んで、改行で区切って配列にする
    const data = fs.readFileSync('history.txt', 'utf-8');
    const lines = data.trim().split('\n');
    // 最新の5件を取得して逆順（新しい順）にする
    const recentHistory = lines.slice(-5).reverse();
    historyHtml = '<ul>' + recentHistory.map(line => `<li>${line}</li>`).join('') + '</ul>';
  }

  // 3. 画面の表示
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.write(`
    <!DOCTYPE html>
    <html>
    <head><title>履歴が見える計算機</title></head>
    <body>
      <h1>Node.js 履歴表示付き計算機</h1>
      <form action="/" method="get">
        <input type="number" name="num1" required> + 
        <input type="number" name="num2" required>
        <button type="submit">計算</button>
      </form>
      <p><strong>${resultText}</strong></p>
      
      <hr>
      <h3>最近の計算履歴（最大5件）</h3>
      ${historyHtml}
      
      <p><a href="/">リセット / 更新</a></p>
    </body>
    </html>
  `);
  res.end();
});

// 3000番ではなく、環境が指定するポート（process.env.PORT）を使うように変更
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`サーバーが起動しました！ ポート: ${port}`);
});