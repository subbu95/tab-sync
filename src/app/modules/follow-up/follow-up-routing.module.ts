import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FollowUpComponent } from './follow-up.component';
import { OverallInitialisationComponent } from './overall-initialisation/overall-initialisation.component';
import { ProductMappedCharResolutionComponent } from './product-mapped-char-resolution/product-mapped-char-resolution.component';
import { RuleInductionComponent } from './rule-induction/rule-induction.component';
import { ProductSegmentResolutionComponent } from './product-segment-resolution/product-segment-resolution.component';
import { ProductOutputSetResolutionComponent } from './product-output-set-resolution/product-output-set-resolution.component';
import { ProductMappedCharRuleGenerationByPosComponent } from './product-mapped-char-rule-generation-by-pos/product-mapped-char-rule-generation-by-pos.component';
import { ProductHierarchyGenerationComponent } from './product-hierarchy-generation/product-hierarchy-generation.component';
import { MappedConversationResolutionComponent } from './mapped-conversation-resolution/mapped-conversation-resolution.component';
import { ProductMappedCharRuleGenerationComponent } from './product-mapped-char-rule-generation/product-mapped-char-rule-generation.component';
import { HistoryScreenComponent } from '../../shared/components/history/history.component';
import { ResolutionByUserComponent } from './resolution-by-user/resolution-by-user.component';

const routes: Routes = [
  { path: '', component: FollowUpComponent },
  { path: 'overall-initialisation', component: OverallInitialisationComponent },
  { path: 'product-mapped-char-resolution', component: ProductMappedCharResolutionComponent },
  { path: 'mapped-conversation-resolution', component: MappedConversationResolutionComponent },
  { path: 'product-hierarchy-generation', component: ProductHierarchyGenerationComponent },
  { path: 'product-mapped-char-rule-generation', component: ProductMappedCharRuleGenerationComponent },
  { path: 'product-mapped-char-rule-generation-by-pos', component: ProductMappedCharRuleGenerationByPosComponent },
  { path: 'product-output-set-resolution', component: ProductOutputSetResolutionComponent },
  { path: 'product-segment-resolution', component: ProductSegmentResolutionComponent },
  { path: 'resolution-by-user', component: ResolutionByUserComponent },
  { path: 'rule-induction', component: RuleInductionComponent },
  { path:'eclipse-history',component:HistoryScreenComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FollowUpRoutingModule {}
