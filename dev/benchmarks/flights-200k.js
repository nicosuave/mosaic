import {
  mplot, watchRender, startInit, brushes1d, run
} from './benchmark-utils.js';

const {
  namedPlots, vconcat, from, name, bin, count, rectY,
  width, height, domainX, intervalX, Selection, Fixed
} = vgplot;

export default function(el) {
  watchRender(3, () => {
    const tasks = ['delay', 'time', 'distance']
      .map(x => namedPlots.get(x))
      .flatMap(plot => brushes1d(plot.selections[0], 2));
    run(tasks);
  });
  startInit();

  const table = 'flights';
  const brush = Selection.crossfilter();
  el.appendChild(
    vconcat(
      mplot(
        name('delay'),
        rectY(
          from(table, { filterBy: brush }),
          { x: bin('delay'), y: count(), fill: 'steelblue', inset: 0.5 }
        ),
        intervalX({ as: brush }),
        domainX(Fixed),
        width(600),
        height(200)
      ),
      mplot(
        name('time'),
        rectY(
          from(table, { filterBy: brush }),
          { x: bin('time'), y: count(), fill: 'steelblue', inset: 0.5 }
        ),
        intervalX({ as: brush }),
        domainX(Fixed),
        width(600),
        height(200)
      ),
      mplot(
        name('distance'),
        rectY(
          from(table, { filterBy: brush }),
          { x: bin('distance'), y: count(), fill: 'steelblue', inset: 0.5 }
        ),
        intervalX({ as: brush }),
        domainX(Fixed),
        width(600),
        height(200)
      )
    )
  );
}
