import { OptionsReview } from "../review/OptionsReview";
import { PlayersReview } from "../review/PlayersReview";
import type {
  HeroLookup,
  PlayerProfileLookup,
  PlayerState,
  PlayerStateMap,
  ReplayInspection,
  ReviewTab,
  UiOptionKey,
  UiOptions,
} from "../../types";

type ReviewPanelProps = {
  activeTab: ReviewTab;
  heroesById: Record<number, HeroLookup>;
  inspection: ReplayInspection | null;
  options: UiOptions;
  playerProfiles: Record<string, PlayerProfileLookup>;
  playerState: PlayerStateMap;
  onOptionChange: (key: UiOptionKey, value: boolean) => void;
  onOptionsChange: (patch: Partial<UiOptions>) => void;
  onUpdatePlayer: (key: string, patch: Partial<PlayerState>) => void;
};

export function ReviewPanel({
  activeTab,
  heroesById,
  inspection,
  options,
  playerProfiles,
  playerState,
  onOptionChange,
  onOptionsChange,
  onUpdatePlayer,
}: ReviewPanelProps) {
  return (
    <section className="review-panel">
      {activeTab === "options" || !inspection ? (
        <OptionsReview
          options={options}
          onOptionChange={onOptionChange}
          onOptionsChange={onOptionsChange}
        />
      ) : (
        <PlayersReview
          heroesById={heroesById}
          players={inspection.players}
          playerProfiles={playerProfiles}
          playerState={playerState}
          onUpdate={onUpdatePlayer}
        />
      )}
    </section>
  );
}
