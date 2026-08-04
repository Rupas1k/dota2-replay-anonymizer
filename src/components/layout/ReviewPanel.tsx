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
import { Panel } from "../ui/Panel";

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
    <Panel className="min-h-[650px] px-[18px] pt-[18px] pb-5 max-[980px]:min-h-[520px] max-[720px]:p-3.5">
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
    </Panel>
  );
}
