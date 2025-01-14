import { render } from 'preact';
import './globals.css';
import { NMEADisplay } from '@jbroll/nmea-widgets';

render(<NMEADisplay />, document.getElementById('app')!);