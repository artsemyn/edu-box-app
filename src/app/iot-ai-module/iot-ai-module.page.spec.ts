import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IotAiModulePage } from './iot-ai-module.page';

describe('IotAiModulePage', () => {
  let component: IotAiModulePage;
  let fixture: ComponentFixture<IotAiModulePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IotAiModulePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
