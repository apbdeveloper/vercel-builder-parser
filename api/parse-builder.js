import cheerio from 'cheerio';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { html } = req.body || {};

  if (!html) {
    return res.status(400).json({ error: 'Missing HTML input' });
  }

  const $ = cheerio.load(html);

  const visibleText = $('body')
    .find('*')
    .contents()
    .filter(function () {
      return this.type === 'text' && $(this).text().trim();
    })
    .map(function () {
      return $(this).text();
    })
    .get()
    .join('\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n\n')
    .trim();

  const email = visibleText.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0] || '';
  const phone = visibleText.match(/(?:\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/)?.[0] || '';
  const address = visibleText.match(/(Unit\s+\d+,\s*)?\d{1,5}[\s\w,.-]+?(Street|St|Place|Pl|Road|Rd|Ave|Avenue|QLD|NSW|VIC|SA|WA)\s+\d{4}/i)?.[0] || '';

  res.status(200).json({
    text: visibleText.slice(0, 12000),
    email,
    phone,
    address
  });
}
