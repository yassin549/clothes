import Area from '@components/common/Area';
import React from 'react';
import './Layout.scss';

export default function OrderEdit() {
  return (
    <div className="grid grid-cols-3 gap-x-8 grid-flow-row ">
      <div className="col-span-2 grid grid-cols-1 gap-8 auto-rows-max">
        <Area id="leftSide" noOuter />
      </div>
      <div className="col-span-1 grid grid-cols-1 gap-8 auto-rows-max">
        <Area id="rightSide" noOuter />
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
