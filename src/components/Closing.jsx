import LotusRule from './LotusRule.jsx';
import Reveal from './Reveal.jsx';

export default function Closing() {
  return (
    <Reveal className="closing mist">
      <p className="closing-thanks">During this difficult time, our family sincerely appreciates your prayers, kind thoughts, love and support. Your compassion and understanding mean more to us than words can express.</p>
      <p className="verse">
        You may have left this world, but you will never leave our hearts. <br />
        Your life was a blessing, your memory a treasure, <br />
        and your love our everlasting strength.
      </p>
      <LotusRule />
      <p className="shanti">Om Shanti, Shanti, Shanti.</p>
    </Reveal>
  );
}
