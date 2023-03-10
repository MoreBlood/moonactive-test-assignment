export class Settings {
  public static animations = {
    gravity: 0.25,
    translate: 0.25,
    destroy: 0.5,
  };

  public static text = {
    packshotTitle: "NICE\nWORK",
    packshotFailTitle: "FAIL!",
    packshotButton: "TRY AGAIN",
    introTitle: "MERGE ALL SIMILAR ITEMS BEFORE TIME RUNS OUT",
    introButton: "START",
    total: "TOTAL",
  };

  public static gamefield = {
    width: 5,
    height: 5,
    dragCompletedThreshold: 0.5,
    dragStartThreshold: 30,
    inArow: 3,
    duration: 10,
    needToScore: 1,
  };
}
