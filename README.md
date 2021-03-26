## run with dependencies
- `npm install`
- `node main.js`

## run without dependencies
- `node dist`

## create single file (zero dependencies)
- `npm install`
- `npm i -g @vercel/ncc`
- `ncc build main.js -o dist`