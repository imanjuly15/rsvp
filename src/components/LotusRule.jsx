import Art from '../lib/art.js';

const glyph = { __html: Art.staticLotusGlyph() };

export default function LotusRule({ className = 'rule' }) {
  return <div className={className} dangerouslySetInnerHTML={glyph} />;
}
