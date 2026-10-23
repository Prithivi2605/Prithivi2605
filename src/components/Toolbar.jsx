export function Toolbar({
  query,
  onQuery,
  onClearQuery,
  browseOpen,
  filtering,
  onBrowse,
  organized,
  onOrganize,
  onReset,
  onSkills,
  onTour,
  showMove,
  arrange,
  onArrange,
  narrow,
  soundOn,
  onSound
}) {
  return (
    <div className="tb" role="toolbar" aria-label="Desk tools">
      <button type="button" id="bMenu" className={filtering ? "on" : ""} aria-expanded={browseOpen} aria-controls="drw" onClick={onBrowse}>Browse</button>
      <label>Find
        <input id="q" type="search" value={query} placeholder="Find something…  ( / )" autoComplete="off" aria-label="Find something on the desk" onChange={(event) => onQuery(event.target.value)} onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          event.stopPropagation();
          onClearQuery();
          event.currentTarget.blur();
        }} />
      </label>
      {showMove && (
        <button type="button" id="bArrange" aria-pressed={arrange} onClick={onArrange}>{arrange ? "Done moving" : "Move items"}</button>
      )}
      <button type="button" id="bReset" onClick={onReset}>Reset desk</button>
      {!narrow && (
        <button type="button" id="bOrg" className={organized ? "on" : ""} onClick={onOrganize}>{organized ? "Messy mode" : "Organize"}</button>
      )}
      <button type="button" id="bSk" onClick={onSkills}>Skills</button>
      <button type="button" id="bSfx" aria-pressed={soundOn} onClick={onSound}>{soundOn ? "Sound on" : "Sound off"}</button>
      <button type="button" id="bStory" onClick={onTour}>Quick tour</button>
    </div>
  );
}

export function Drawer({ open, categories, active, onPick }) {
  return (
    <div className={`drawer${open ? " on" : ""}`} id="drw" role="group" aria-label="Filter desk objects">
      {categories.map((category) => (
        <button type="button" key={category.name} className={active === category.name ? "on" : ""} onClick={() => onPick(category.name)}>
          {category.name}<span>{category.count}</span>
        </button>
      ))}
    </div>
  );
}

export function TourBar({ index, total, text, onBack, onNext, onSkip }) {
  return (
    <div id="tour" className="on" role="region" aria-label="Quick tour">
      <div className="tt">
        <small>QUICK TOUR · {index + 1} / {total}</small>
        <span>{text}</span>
      </div>
      <button type="button" onClick={onBack} disabled={index === 0}>Back</button>
      <button type="button" className="p" onClick={onNext}>{index === total - 1 ? "Finish" : "Next"}</button>
      <button type="button" onClick={onSkip}>Skip</button>
    </div>
  );
}
