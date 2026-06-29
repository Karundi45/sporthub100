import React from 'react';
import { LeafletView, WebviewLeafletMessage } from 'react-native-leaflet-view';

export default function Map(props: any) {
  return <LeafletView {...props} />;
}
