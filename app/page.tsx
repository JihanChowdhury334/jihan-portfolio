import { portfolioHtml } from './content';
import Effects from './effects';
export default function Home() { return <><div dangerouslySetInnerHTML={{__html:portfolioHtml}} /><Effects /></>; }
