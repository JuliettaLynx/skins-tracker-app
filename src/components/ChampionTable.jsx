import SkinCard from './SkinCard.jsx'
import SkinChip from './SkinChip.jsx'
import SkinsColumn from './SkinsColumn.jsx'
import { LIST, LIST_TITLES, skinKey } from '../skins.js'

// Table: champion | collection | shards | all skins of the champion.
export default function ChampionTable({ rows, onMove }) {
  return (
    <table className="champ-table">
      <thead>
        <tr>
          <th className="champ-table__champion">
            <span className="champ-table__num">#</span>Чемпион
          </th>
          <th>{LIST_TITLES[LIST.collection]}</th>
          <th>{LIST_TITLES[LIST.shards]}</th>
          <th>{LIST_TITLES[LIST.rest]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.champion}>
            <th className="champ-table__champion" scope="row">
              <span className="champ-table__num">{row.num}</span>
              {row.champion}
            </th>
            <td>
              <SkinsColumn
                list={LIST.collection}
                title={LIST_TITLES[LIST.collection]}
                items={row.collection}
                onMove={onMove}
                renderItem={(skin) => (
                  <SkinCard key={skinKey(skin)} skin={skin} list={LIST.collection} onMove={onMove} />
                )}
              />
            </td>
            <td>
              <SkinsColumn
                list={LIST.shards}
                title={LIST_TITLES[LIST.shards]}
                items={row.shards}
                onMove={onMove}
                renderItem={(skin) => (
                  <SkinCard key={skinKey(skin)} skin={skin} list={LIST.shards} onMove={onMove} />
                )}
              />
            </td>
            <td>
              <SkinsColumn
                list={LIST.rest}
                title={LIST_TITLES[LIST.rest]}
                items={row.rest}
                onMove={onMove}
                renderItem={(skin) => <SkinChip key={skinKey(skin)} skin={skin} onMove={onMove} />}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
