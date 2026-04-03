# CEIP Library セットアップガイド

Disney Library（disney-library）と同じ構成。GAS + Vercel。

## 前提
- disney-library が既にデプロイ済み
- GitHub / Vercel アカウントあり

---

## Step 1: スプレッドシートをGoogle Sheetsにインポート（3分）

1. Google Drive を開く
2. `CEIP_DIX_Links.xlsx` をアップロード
3. 右クリック →「Google スプレッドシートで開く」
4. シート名が `📚 CEIP人物索引` であることを確認

## Step 2: GASをデプロイ（5分）

1. Google スプレッドシートで「拡張機能 → Apps Script」を開く
2. `gas/Code.gs` の中身をすべてコピーして貼り付け
3. 「デプロイ → 新しいデプロイ」をクリック
4. 種類：「ウェブアプリ」
5. 「アクセスできるユーザー」→「全員」
6. 「デプロイ」→ 発行されたURLをコピー

## Step 3: GitHubリポジトリを作成（3分）

```bash
cd ~/ceip-library
git init
git add .
git commit -m "initial commit"
```

GitHub で `ceip-library` リポジトリを新規作成（Public）して：

```bash
git remote add origin https://github.com/YOUR_USERNAME/ceip-library.git
git branch -M main
git push -u origin main
```

## Step 4: GAS URLを設定（1分）

`api/data.js` の `YOUR_GAS_DEPLOY_URL_HERE` を Step 2 で取得したURLに置き換え：

```bash
sed -i '' 's|YOUR_GAS_DEPLOY_URL_HERE|https://script.google.com/macros/s/XXXXX/exec|g' api/data.js
git add api/data.js
git commit -m "set GAS URL"
git push
```

## Step 5: Vercelにデプロイ（3分）

1. https://vercel.com/new を開く
2. GitHubの `ceip-library` リポジトリをインポート
3. Framework Preset: `Vite` を選択
4. 「Deploy」をクリック
5. URLが発行される → 完成！

---

## 運用

- **データ追加**: Google スプレッドシートに行を追加するだけ
- **ダッシュボードに反映**: 自動（60秒キャッシュ後に更新）
- **デプロイ不要**: コードを変更しない限りVercel再デプロイは不要

## ファイル構成

```
ceip-library/
├── api/
│   └── data.js          ← Vercel Serverless Function（GASプロキシ）
├── src/
│   ├── App.jsx          ← Reactダッシュボード本体
│   └── main.jsx         ← エントリーポイント
├── gas/
│   └── Code.gs          ← GASに貼り付けるコード
├── index.html
├── vite.config.js
├── package.json
└── SETUP_GUIDE.md       ← このファイル
```
