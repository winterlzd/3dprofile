export const defaultLayout = {
  identity:{position:[-345,245,155],rotation:[-.025,.11,-.018]},
  intro:{position:[-345,-100,215],rotation:[.045,.16,.025]},
  'project-0':{position:[445,195,25],rotation:[-.07,-.22,.055]},
  'project-1':{position:[930,-340,-250],rotation:[.10,-.36,-.055]},
  'project-2':{position:[-815,-455,-245],rotation:[.065,.33,-.035]},
  'project-3':{position:[125,-925,-700],rotation:[.18,-.12,.045]},
  'project-4':{position:[1180,690,-655],rotation:[-.15,-.4,.055]},
  'project-5':{position:[1545,165,-1160],rotation:[.03,-.5,-.06]},
  about:{position:[-1220,350,-680],rotation:[-.035,.4,.025]},
  practice:{position:[-1040,-760,-860],rotation:[.13,.32,-.025]},
  'skill-0':{position:[-1680,-70,-620],rotation:[.015,.52,-.055]},
  'skill-1':{position:[-1470,-485,0],rotation:[.11,.4,.05]},
  'skill-2':{position:[-1540,885,-1240],rotation:[-.16,.36,-.07]},
  'skill-3':{position:[-645,960,-1600],rotation:[-.13,.15,.04]},
  'journey-0':{position:[-590,765,-760],rotation:[-.12,.18,-.04]},
  'journey-1':{position:[40,940,-1140],rotation:[-.13,-.04,.035]},
  'journey-2':{position:[650,850,-600],rotation:[-.12,-.28,-.04]},
  github:{position:[100,-290,275],rotation:[.06,-.11,-.04]},
  youtube:{position:[395,-295,310],rotation:[.03,-.20,.055]},
  footer:{position:[450,-570,-420],rotation:[.08,-.14,0]},
};

export function validSavedTransform(value) {
  return value && Array.isArray(value.position) && value.position.length===3 && value.position.every(v=>Number.isFinite(v)&&Math.abs(v)<20000)
    && Array.isArray(value.rotation) && value.rotation.length===3 && value.rotation.every(v=>Number.isFinite(v)&&Math.abs(v)<Math.PI*4);
}

export function loadSavedLayout(storage) {
  try {
    const parsed=JSON.parse(storage.getItem('zd-spatial-layout-v2') || '{}');
    return Object.fromEntries(Object.entries(parsed).filter(([id,transform])=>id in defaultLayout && validSavedTransform(transform)));
  } catch {return {};}
}
