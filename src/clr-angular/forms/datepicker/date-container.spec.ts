/*
 * Copyright (c) 2016-2019 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TestBed, async } from '@angular/core/testing';
import { Subscription } from 'rxjs';

import { itIgnore } from '../../../../tests/tests.helpers';
import { TestContext } from '../../data/datagrid/helpers.spec';
import { ClrPopoverToggleService } from '../../utils/popover/providers/popover-toggle.service';
import { IfErrorService } from '../common/if-error/if-error.service';
import { ControlClassService } from '../common/providers/control-class.service';
import { ControlIdService } from '../common/providers/control-id.service';
import { FocusService } from '../common/providers/focus.service';
import { Layouts, LayoutService } from '../common/providers/layout.service';
import { NgControlService } from '../common/providers/ng-control.service';
import { PopoverPosition } from '../../popover/common/popover-positions';

import { ClrDateContainer } from './date-container';
import { DateFormControlService } from './providers/date-form-control.service';
import { DateIOService } from './providers/date-io.service';
import { DateNavigationService } from './providers/date-navigation.service';
import { DatepickerEnabledService } from './providers/datepicker-enabled.service';
import { MockDatepickerEnabledService } from './providers/datepicker-enabled.service.mock';
import { LocaleHelperService } from './providers/locale-helper.service';
import { ClrCommonFormsModule } from '../common/common.module';

export default function() {
  describe('Date Container Component', () => {
    let context: TestContext<ClrDateContainer, TestComponent>;
    let enabledService: MockDatepickerEnabledService;
    let dateFormControlService: DateFormControlService;
    let toggleService: ClrPopoverToggleService;

    beforeEach(function() {
      TestBed.configureTestingModule({
        imports: [FormsModule, ClrCommonFormsModule],
      });
      TestBed.overrideComponent(ClrDateContainer, {
        set: {
          providers: [
            { provide: DatepickerEnabledService, useClass: MockDatepickerEnabledService },
            ClrPopoverToggleService,
            DateNavigationService,
            LocaleHelperService,
            ControlClassService,
            IfErrorService,
            FocusService,
            LayoutService,
            NgControlService,
            DateIOService,
            ControlIdService,
            DateFormControlService,
          ],
        },
      });

      context = this.create(ClrDateContainer, TestComponent, []);

      enabledService = <MockDatepickerEnabledService>context.getClarityProvider(DatepickerEnabledService);
      dateFormControlService = context.getClarityProvider(DateFormControlService);
      toggleService = context.getClarityProvider(ClrPopoverToggleService);
    });

    // @deprecated these tests refer to the old forms layout only and can be removed when its removed

    describe('View Basics', () => {
      beforeEach(() => {
        context.detectChanges();
      });

      it('should returns focus to calendar when we close it', () => {
        const actionButton: HTMLButtonElement = context.clarityElement.querySelector('.clr-input-group-icon-action');
        const actionButtonSpy = spyOn(actionButton, 'focus');
        toggleService.open = true;
        context.detectChanges();
        toggleService.open = false;
        context.detectChanges();
        expect(actionButtonSpy.calls.count()).toBe(1);
      });

      it('should not call focus when date-picker is not visible', () => {
        const actionButton: HTMLButtonElement = context.clarityElement.querySelector('.clr-input-group-icon-action');
        const actionButtonSpy = spyOn(actionButton, 'focus');
        const event = new KeyboardEvent('keyup', {
          key: 'Escape',
        });
        document.body.dispatchEvent(event);
        context.detectChanges();
        expect(actionButtonSpy.calls.count()).toBe(0);
      });

      it('applies the clr-form-control class', () => {
        expect(context.clarityElement.className).toContain('clr-form-control');
      });

      it('renders the datepicker toggle button based on the enabled service', () => {
        expect(enabledService.isEnabled).toBe(true);
        expect(context.clarityElement.querySelector('.clr-input-group-icon-action')).not.toBeNull();

        enabledService.fakeIsEnabled = false;
        context.detectChanges();

        expect(context.clarityElement.querySelector('.clr-input-group-icon-action')).toBeNull();
      });

      it('clicking on the button toggles the datepicker popover', () => {
        spyOn(context.clarityDirective, 'toggleDatepicker');
        const button: HTMLButtonElement = context.clarityElement.querySelector('.clr-input-group-icon-action');

        button.click();
        context.detectChanges();

        expect(context.clarityDirective.toggleDatepicker).toHaveBeenCalled();
      });

      it('projects the date input', () => {
        context.detectChanges();
        expect(context.clarityElement.querySelector('input')).not.toBeNull();
      });

      it('shows the datepicker view manager when icon button is clicked', () => {
        expect(context.clarityElement.querySelector('clr-datepicker-view-manager')).toBeNull();

        const button: HTMLButtonElement = context.clarityElement.querySelector('.clr-input-group-icon-action');
        button.click();
        context.detectChanges();

        expect(context.clarityElement.querySelector('clr-datepicker-view-manager')).not.toBeNull();
      });

      it('tracks the disabled state', async(() => {
        expect(context.clarityElement.className).not.toContain('clr-form-control-disabled');
        context.testComponent.disabled = true;
        context.detectChanges();
        // Have to wait for the whole control to settle or it doesn't track
        context.fixture.whenStable().then(() => {
          context.detectChanges();
          expect(context.clarityElement.className).toContain('clr-form-control-disabled');
        });
      }));

      it('has an accessible title on the calendar toggle button', () => {
        const toggleButton: HTMLButtonElement = context.clarityElement.querySelector('.clr-input-group-icon-action');
        expect(toggleButton.title).toEqual('Toggle datepicker');
      });

      it('has an accessible aria-label on the calendar toggle button', () => {
        const toggleButton: HTMLButtonElement = context.clarityElement.querySelector('.clr-input-group-icon-action');
        expect(toggleButton.attributes['aria-label'].value).toEqual('Toggle datepicker');
      });

      it('supports clrPosition option', () => {
        expect(context.clarityDirective.position).toBeUndefined();
        context.testComponent.position = 'top-left';
        context.detectChanges();
        expect(context.clarityDirective.position).toEqual('top-left');
      });
    });

    describe('Typescript API', () => {
      // IE doesn't support MouseEvent constructors
      itIgnore(['ie'], 'toggles the datepicker popover', () => {
        const fakeEvent: MouseEvent = new MouseEvent('fakeEvent');
        let flag: boolean;
        const sub: Subscription = toggleService.openChange.subscribe(open => {
          flag = open;
        });

        expect(flag).toBeUndefined();
        context.clarityDirective.toggleDatepicker(fakeEvent);
        context.detectChanges();

        expect(flag).toBe(true);

        sub.unsubscribe();
      });

      it('marks the date control as touched when the datepicker popover is toggled', () => {
        spyOn(dateFormControlService, 'markAsTouched');

        context.clarityDirective.toggleDatepicker(null);

        expect(dateFormControlService.markAsTouched).toHaveBeenCalled();
      });

      it('returns the classes to apply to the control', () => {
        expect(context.clarityDirective.controlClass()).toContain('clr-col-md-10');
        expect(context.clarityDirective.controlClass()).toContain('clr-col-12');
        expect(context.clarityDirective.controlClass()).not.toContain('clr-error');
        context.clarityDirective.invalid = true;
        expect(context.clarityDirective.controlClass()).toContain('clr-error');
        const controlClassService = context.getClarityProvider(ControlClassService);
        const layoutService = context.getClarityProvider(LayoutService);
        layoutService.layout = Layouts.VERTICAL;
        context.clarityDirective.invalid = false;
        expect(context.clarityDirective.controlClass()).not.toContain('clr-error');
        expect(context.clarityDirective.controlClass()).not.toContain('clr-col-md-10');
        controlClassService.className = 'clr-col-2';
        expect(context.clarityDirective.controlClass()).not.toContain('clr-col-md-10');
      });
    });
  });
}

@Component({
  template: `
        <clr-date-container [clrPosition]="position">
            <input type="date" clrDate [(ngModel)]="model" [disabled]="disabled">
        </clr-date-container>
    `,
})
class TestComponent {
  model = '';
  disabled = false;
  position: PopoverPosition;
}
